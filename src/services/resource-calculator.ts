/**
 * 资源上限计算服务
 *
 * 根据角色属性和生命层级自动计算 HP/MP/SP 上限：
 *   HP = 体质 × 100 × [HP乘数] + [五维属性总和]
 *   MP = (智力 + 精神) × 50 × [MP/SP乘数]
 *   SP = (力量 + 敏捷) × 50 × [MP/SP乘数]
 */

import { getHpMultiplier, getMpSpMultiplier, getTierForLevel } from '../config';
import type { MessageVariables } from '../types';
import { safeGet } from '../utils';

/** 安全获取属性值 */
const getAttr = (obj: any, key: string): number => {
  return Number(safeGet(obj, `属性.${key}`, 0)) || 0;
};

/** 计算单个角色（主角或 NPC）的资源上限并回写 */
const calculateResourcesFor = (character: any): void => {
  const level = Number(safeGet(character, '等级', 1)) || 1;
  const tier = safeGet(character, '生命层级', '') || getTierForLevel(level);

  const hpMul = getHpMultiplier(tier);
  const mpSpMul = getMpSpMultiplier(tier);

  const 力量 = getAttr(character, '力量');
  const 敏捷 = getAttr(character, '敏捷');
  const 体质 = getAttr(character, '体质');
  const 智力 = getAttr(character, '智力');
  const 精神 = getAttr(character, '精神');

  const totalAttrs = 力量 + 敏捷 + 体质 + 智力 + 精神;

  const hpMax = Math.round(体质 * 100 * hpMul + totalAttrs);
  const mpMax = Math.round((智力 + 精神) * 50 * mpSpMul);
  const spMax = Math.round((力量 + 敏捷) * 50 * mpSpMul);

  _.set(character, '生命值上限', hpMax);
  _.set(character, '法力值上限', mpMax);
  _.set(character, '体力值上限', spMax);

  // 当前值若超过新上限则夹紧
  const currentHp = Number(safeGet(character, '生命值', 0)) || 0;
  const currentMp = Number(safeGet(character, '法力值', 0)) || 0;
  const currentSp = Number(safeGet(character, '体力值', 0)) || 0;

  if (currentHp > hpMax) _.set(character, '生命值', hpMax);
  if (currentMp > mpMax) _.set(character, '法力值', mpMax);
  if (currentSp > spMax) _.set(character, '体力值', spMax);
};

/**
 * 计算所有角色（主角 + NPC）的资源上限
 *
 * @param new_variables - 更新后的变量数据
 */
export const calculateResourceLimits = (new_variables: MessageVariables): void => {
  // 计算主角资源上限
  const character = safeGet(new_variables, 'stat_data.主角', {} as any);
  calculateResourcesFor(character);

  // 计算 NPC 资源上限
  const partners = safeGet(new_variables, 'stat_data.关系列表', {} as Record<string, any>);
  _.forEach(partners, (npc: any) => {
    calculateResourcesFor(npc);
  });
};
