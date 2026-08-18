/**
 * 命定之诗 - 脚本主入口
 *
 * 监听 MVU 变量框架的 VARIABLE_UPDATE_ENDED 事件，
 * 在变量更新完成后执行各种处理逻辑
 */

import type { MessageVariables } from './types';
import { Schema } from './zod_schema/schema';

// Services
import { processEvent } from './services/event';
import { processExperienceAndLevel } from './services/experience';
import { maintainCharacterData } from './services/maintain';
import { processNPCExperienceAndLevel } from './services/npc-experience';
import { calculateResourceLimits } from './services/resource-calculator';

// Injection
import { injectEventPrompts } from './injection/event-prompts';
import { injectGameInfo } from './injection/game-info';
import { injectLevelPrompts } from './injection/level-prompts';

// Utils
import { deepClone, errorCatched, uninject } from './utils';

// Schema
import { achievement } from '@/services/achievement';
import { DefaultLogData, logSystem } from '@/services/log';

/** date 数据默认值 */
const DefaultDate: MessageVariables['date'] = {
  event: { cache: '', completed_events: [] },
  npcs: {},
  npcLevelUpWithPlayer: true,
  requiresContractForExp: true,
  ascensionLawReady: false,
  log: DefaultLogData,
};

/**
 * 变量更新处理函数
 */
const handleVariableUpdate = (data: Mvu.MvuData, data_before_update: Mvu.MvuData): void => {
  // 使用 insertVariables 确保 date 数据存在（仅插入不存在的字段）
  insertVariables({ date: DefaultDate }, { type: 'message' });

  // 使用 Schema.safeParse 规范化 stat_data
  const parsed = Schema.safeParse(data.stat_data);
  if (!parsed.success) {
    console.error('[命定之诗] stat_data 校验失败', parsed.error);
  }

  // 使用 deepClone 保护原数据
  data.stat_data = deepClone(parsed.success ? parsed.data : data.stat_data);

  // 获取当前 date 数据
  const currentDate = _.get(data, 'date', DefaultDate) as MessageVariables['date'];
  const oldDate = _.get(data_before_update, 'date', DefaultDate) as MessageVariables['date'];

  // 构造变量引用
  const current: MessageVariables = {
    stat_data: data.stat_data as MessageVariables['stat_data'],
    date: currentDate,
  };
  const old: MessageVariables = {
    stat_data: data_before_update.stat_data as MessageVariables['stat_data'],
    date: oldDate,
  };

  uninject();
  maintainCharacterData(current, old);
  processExperienceAndLevel(current, old);
  processNPCExperienceAndLevel(current, old);
  calculateResourceLimits(current);
  const shouldDeleteEventCache = processEvent(current);
  logSystem(current, old);

  if (shouldDeleteEventCache) {
    deleteVariable('date.event.cache', { type: 'message' });
  }
};

/**
 * JSON Patch 的 replace、delta、insert/add、remove、move 会分别转为 set、add、insert、delete、move
 *
 * JSON Patch 在 COMMAND_PARSED 前会转换为 MVU 命令，路径中的 / 会转换为 .：
 * - replace /path/to/variable -> { type: 'set', args: ['path.to.variable', JSON.stringify(value)] }
 * - delta /path/to/number/variable -> { type: 'add', args: ['path.to.number.variable', JSON.stringify(value)] }
 * - insert /path/to/object/new_key -> { type: 'insert', args: ['path.to.object', "'new_key'", JSON.stringify(value)] }
 * - insert /path/to/array/- -> { type: 'insert', args: ['path.to.array', "'-'", JSON.stringify(value)] }
 * - remove /path/to/object/key -> { type: 'delete', args: ['path.to.object.key'] }
 * - remove /path/to/array/0 -> { type: 'delete', args: ['path.to.array.0'] }
 * - move from /path/to/variable to /path/to/another/path -> { type: 'move', args: ['path.to.variable', 'path.to.another.path'] }
 *
 * 此处使用转换后的 MVU 命令类型；未列出的操作仍可执行。
 */
// 注意路径为严格匹配，没有保护父、子路径
type PolicyCommandType = Mvu.CommandInfo['type'] | 'keyed_insert' | 'keyed_delete';
type PolicyCommandInfo = { type: PolicyCommandType; path: string };

const commandPolicies: Record<string, readonly PolicyCommandType[]> = {
  'stat_data.事件.信号': ['set', 'add', 'delete', 'move', 'keyed_insert', 'keyed_delete'],
};

/**
 * COMMAND_PARSED 时 key 仍是字面量（如 `'信号'`），策略路径使用实际 key。
 * 这里只移除最外层引号，不解析转义或复杂路径；当前策略 key 均为简单字段。
 */
const getCommandKey = (key: string): string => key.replace(/^['"]|['"]$/g, '');

const getPolicyCommandInfo = (command: Mvu.CommandInfo): PolicyCommandInfo[] => {
  if (command.type === 'move') {
    return command.args.map(path => ({ type: 'move', path }));
  }
  if (command.type === 'insert' && command.args.length === 3) {
    const [parentPath, key] = command.args;
    return [
      { type: 'insert', path: parentPath },
      {
        type: 'keyed_insert',
        path: `${parentPath}.${getCommandKey(key)}`,
      },
    ];
  }
  if (command.type === 'delete' && command.args.length === 2) {
    const [parentPath, key] = command.args;
    return [
      { type: 'delete', path: parentPath },
      {
        type: 'keyed_delete',
        path: `${parentPath}.${getCommandKey(key)}`,
      },
    ];
  }
  return [{ type: command.type, path: command.args[0] }];
};

const shouldExcludeCommand = (command: Mvu.CommandInfo): boolean =>
  getPolicyCommandInfo(command).some(
    ({ type, path }) => commandPolicies[path]?.includes(type) ?? false
  );

const handleCommandParsed = (_variables: Mvu.MvuData, commands: Mvu.CommandInfo[]): void => {
  const retainedCommands = commands.filter(command => !shouldExcludeCommand(command));
  commands.splice(0, commands.length, ...retainedCommands);
};

/**
 * 注入所有提示词
 * 组合函数，在生成前注入所有需要的提示
 */
const injectAllPrompts = (): void => {
  const variables = getVariables({ type: 'message', message_id: -2 }) as MessageVariables;

  injectGameInfo(variables);
  injectEventPrompts(variables);
  injectLevelPrompts(variables);
};

/**
 * 初始化脚本
 */
const init = async (): Promise<void> => {
  // 等待 MVU 初始化完成
  await waitGlobalInitialized('Mvu');

  // 监听 COMMAND_PARSED
  eventOn(Mvu.events.COMMAND_PARSED, errorCatched(handleCommandParsed));

  // 监听变量更新结束事件
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, errorCatched(handleVariableUpdate));

  // 监听生成相关事件，注入提示词
  eventOn(tavern_events.GENERATION_AFTER_COMMANDS, injectAllPrompts);
  eventOn(tavern_events.MESSAGE_SENT, injectAllPrompts);
  eventOn(tavern_events.MESSAGE_UPDATED, injectAllPrompts);

  eventOn(getButtonEvent('查看成就'), achievement);
  console.log("[命定之诗] 脚本已加载 ฅ'ω'ฅ");
  toastr.success("[命定之诗] 脚本已加载 ฅ'ω'ฅ");
};

// 使用 jQuery 的 ready 事件启动
$(() => {
  errorCatched(init)();
});
