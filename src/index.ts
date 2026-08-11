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
