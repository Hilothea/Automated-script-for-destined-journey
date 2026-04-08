/**
 * 升级提示注入模块
 * 向上下文注入等级提升相关的提示信息
 *
 * 设计说明：
 * - 升级信息在 AI 消息处理时存储到 date.levelUp
 * - 本模块在 User 消息发送前读取 date.levelUp 并注入提示
 * - 注入后清理 date.levelUp，确保提示只出现一次
 */
import type { MessageVariables } from '../types';
import { injectMultiplePrompts, safeGet } from '../utils';

/**
 * 注入升级提示
 * - 主角成长聚合提示
 * - NPC 成长聚合提示
 */
export const injectLevelPrompts = (variables: MessageVariables): void => {
  // 获取升级数据
  const characterLevelUp = safeGet(variables, 'date.levelUpCharacter', null as string[] | null);
  const npcLevelUp = safeGet(variables, 'date.levelUpNpcs', null as string[] | null);

  // 如果没有升级数据，直接返回
  if (!characterLevelUp && !npcLevelUp) {
    return;
  }

  // 收集需要注入的提示
  const prompts: Array<{
    id: string;
    content: string;
    position?: 'none' | 'in_chat';
    depth?: number;
    role?: 'system' | 'user' | 'assistant';
  }> = [];

  // 主角升级提示
  if (characterLevelUp && characterLevelUp.length > 0) {
    prompts.push({
      id: '等级提升',
      content: `core_system: ${characterLevelUp.join('; ')}`,
      position: 'in_chat',
      depth: 0,
      role: 'system',
    });
  }

  // NPC 升级提示
  if (npcLevelUp && npcLevelUp.length > 0) {
    prompts.push({
      id: 'NPC等级提升',
      content: `core_system: ${npcLevelUp.join('; ')}`,
      position: 'in_chat',
      depth: 0,
      role: 'system',
    });
  }

  // 批量注入
  if (prompts.length > 0) {
    injectMultiplePrompts(prompts);
  }

  // 清理升级数据，确保提示只出现一次
  insertOrAssignVariables(
    { date: { levelUpCharacter: null, levelUpNpcs: null } },
    { type: 'message', message_id: -1 }
  );
};
