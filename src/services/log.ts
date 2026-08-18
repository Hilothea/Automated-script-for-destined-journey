/**
 * 日志系统服务
 * 负责跟踪和记录游戏统计数据
 * 数据存储在 date.log 下
 */

import type { LogData, MessageVariables } from '@/types';
import { safeGet } from '@/utils';

/** 日志数据默认值 */
export const DefaultLogData: LogData = {
  deathCount: 0,
  maxCurrencyDebt: 0,
  bankruptcyCount: 0,
  illegalLevelUpId: [],
  totalFPGained: 0,
  timeRecord: {},
  locationRecord: {},
};

/**
 * 获取日志数据（从 date.log 获取，不存在则返回默认值的副本）
 */
const getLogData = (variables: MessageVariables): LogData => {
  const existingLog = safeGet(variables, 'date.log', null);
  if (existingLog) {
    return existingLog;
  } else {
    return { ...DefaultLogData };
  }
};

/**
 * 检测角色死亡
 * 当生命值从正数变为0或以下时计为死亡
 */
const checkDeath = (current: MessageVariables, old: MessageVariables, log: LogData): void => {
  if (!_.has(old, 'stat_data.主角.生命值.当前')) {
    return;
  }

  const currentHp = safeGet(current, 'stat_data.主角.生命值.当前', 1);
  const oldHp = safeGet(old, 'stat_data.主角.生命值.当前', 1);

  if (oldHp > 0 && currentHp <= 0) {
    log.deathCount++;
  }
};

/**
 * 检测货币欠款
 * 当金钱为负数时，记录最大欠款额度
 */
const checkCurrencyDebt = (current: MessageVariables, log: LogData): void => {
  const 金钱 = safeGet(current, 'stat_data.主角.金钱', 0);

  if (金钱 < 0) {
    const debt = Math.abs(金钱);
    if (debt > log.maxCurrencyDebt) {
      log.maxCurrencyDebt = debt;
    }
  }
};

/**
 * 检测破产
 * 当金钱从正数变为0或负数时计为破产
 */
const checkBankruptcy = (current: MessageVariables, old: MessageVariables, log: LogData): void => {
  if (!_.has(old, 'stat_data.主角.金钱')) {
    return;
  }

  const currentMoney = safeGet(current, 'stat_data.主角.金钱', 0);
  const oldMoney = safeGet(old, 'stat_data.主角.金钱', 0);

  if (oldMoney > 0 && currentMoney <= 0) {
    log.bankruptcyCount++;
  }
};

/**
 * 检测FP(命运点数)获取
 * 当命运点数增加时，累加到总获取量
 */
const checkFPGained = (current: MessageVariables, old: MessageVariables, log: LogData): void => {
  if (!_.has(old, 'stat_data.命运点数')) {
    return;
  }

  const currentFP = safeGet(current, 'stat_data.命运点数', 0);
  const oldFP = safeGet(old, 'stat_data.命运点数', 0);

  if (currentFP > oldFP) {
    const gained = currentFP - oldFP;
    log.totalFPGained += gained;
  }
};

/**
 * 记录每个楼层的时间
 * 从 stat_data.世界.时间 获取当前时间，以楼层ID为键存储到 log.timeRecord
 */
const _recordTime = (current: MessageVariables, log: LogData): void => {
  // 获取当前世界时间
  const time = safeGet(current, 'stat_data.世界.时间', '');

  // 如果时间为空则不记录
  if (!time) {
    return;
  }

  // 获取楼层ID
  const messageId = getLastMessageId();

  // 记录该楼层的时间
  log.timeRecord[messageId] = time;
};

/**
 * 记录每个楼层的地点
 * 从 stat_data.世界.地点 获取当前地点，以楼层ID为键存储到 log.locationRecord
 */
const _recordLocation = (current: MessageVariables, log: LogData): void => {
  // 获取当前世界地点
  const location = safeGet(current, 'stat_data.世界.地点', '');

  // 如果地点为空则不记录
  if (!location) {
    return;
  }

  // 获取楼层ID
  const messageId = getLastMessageId();

  // 记录该楼层的地点
  log.locationRecord[messageId] = location;
};

/**
 * 记录AI非法提升等级
 * 由 maintain.ts 调用，使用 getLastMessageId() 获取发生错误的楼层号
 */
export const recordIllegalLevelUp = (): void => {
  // 获取当前日志数据
  const variables = getVariables({ type: 'message' }) as MessageVariables;
  const log = getLogData(variables);

  // 获取发生错误的楼层ID
  const messageId = getLastMessageId();

  // 如果该楼层ID尚未记录，则添加到列表中
  if (!log.illegalLevelUpId.includes(messageId)) {
    log.illegalLevelUpId.push(messageId);
  }

  // 使用 insertOrAssignVariables 持久化
  insertOrAssignVariables(
    { date: { log: { illegalLevelUpId: log.illegalLevelUpId } } },
    { type: 'message' }
  );
};

/**
 * 日志系统主函数
 * 在变量更新时检测并记录各种统计数据
 */
export const logSystem = (
  new_variables: MessageVariables,
  old_variables: MessageVariables
): void => {
  if (!_.has(old_variables, 'stat_data') || !_.has(new_variables, 'stat_data')) {
    return;
  }

  // 获取现有的日志数据
  const log = getLogData(new_variables);

  // 检测各种事件
  checkDeath(new_variables, old_variables, log);
  checkCurrencyDebt(new_variables, log);
  checkBankruptcy(new_variables, old_variables, log);
  checkFPGained(new_variables, old_variables, log);

  // 使用 insertOrAssignVariables 持久化 date.log 到消息楼层变量
  // 只更新本函数管理的字段，避免覆盖 recordIllegalLevelUp 更新的 illegalLevelUpCount
  insertOrAssignVariables(
    {
      date: {
        log: {
          deathCount: log.deathCount,
          maxCurrencyDebt: log.maxCurrencyDebt,
          bankruptcyCount: log.bankruptcyCount,
          totalFPGained: log.totalFPGained,
          timeRecord: log.timeRecord,
          locationRecord: log.locationRecord,
        },
      },
    },
    { type: 'message' }
  );
};
