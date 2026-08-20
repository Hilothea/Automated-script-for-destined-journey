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
const calculateResourcesFor = (character: any, initializeCurrent = false): void => {
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

  _.set(character, '生命值.上限._基础', hpMax);
  _.set(character, '法力值.上限._基础', mpMax);
  _.set(character, '体力值.上限._基础', spMax);

  // 当前值若超过新上限则夹紧
  const currentHp = Number(safeGet(character, '生命值.当前', 0)) || 0;
  const currentMp = Number(safeGet(character, '法力值.当前', 0)) || 0;
  const currentSp = Number(safeGet(character, '体力值.当前', 0)) || 0;

  const hpLimit = Math.max(0, hpMax + Number(safeGet(character, '生命值.上限.额外', 0)));
  const mpLimit = Math.max(0, mpMax + Number(safeGet(character, '法力值.上限.额外', 0)));
  const spLimit = Math.max(0, spMax + Number(safeGet(character, '体力值.上限.额外', 0)));

  _.set(character, '生命值.当前', initializeCurrent ? hpLimit : _.clamp(currentHp, 0, hpLimit));
  _.set(character, '法力值.当前', initializeCurrent ? mpLimit : _.clamp(currentMp, 0, mpLimit));
  _.set(character, '体力值.当前', initializeCurrent ? spLimit : _.clamp(currentSp, 0, spLimit));
};

/**
 * 计算所有角色（主角 + NPC）的资源上限
 *
 * @param new_variables - 更新后的变量数据
 * @param old_variables - 更新前的变量数据，用于识别首次出现的 NPC
 */
export const calculateResourceLimits = (
  new_variables: MessageVariables,
  old_variables: MessageVariables = new_variables
): void => {
  // 计算主角资源上限
  const character = safeGet(new_variables, 'stat_data.主角', {} as any);
  calculateResourcesFor(character);

  // 计算 NPC 资源上限
  const partners = safeGet(new_variables, 'stat_data.关系列表', {} as Record<string, any>);
  const oldPartners = safeGet(old_variables, 'stat_data.关系列表', {} as Record<string, any>);
  _.forEach(partners, (npc: any, name: string) => {
    const oldNpc = oldPartners[name];
    const isNewNpc = !_.has(oldPartners, name);
    const wasPresent = safeGet(oldNpc, '在场', undefined as boolean | undefined);
    const isPresent = safeGet(npc, '在场', undefined as boolean | undefined);
    const becamePresent = wasPresent !== true && isPresent === true;

    calculateResourcesFor(npc, isNewNpc || becamePresent);
  });
};
