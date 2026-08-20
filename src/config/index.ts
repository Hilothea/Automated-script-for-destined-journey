/**
 * 游戏配置模块
 * 包含里程碑等级、经验表、货币兑换率等核心配置
 */

/** 里程碑等级属性加成 */
export interface MilestoneBonus {
  attributes: number; // 所有属性统一加成值
  tier: string;
}

/** 里程碑等级配置 - 达到特定等级时获得属性加成和层级提升 */
export const MilestoneLevels: Readonly<Record<number, MilestoneBonus>> = {
  5: { attributes: 1, tier: '第二层级/中坚' },
  9: { attributes: 1, tier: '第三层级/精英' },
  13: { attributes: 1, tier: '第四层级/史诗' },
  17: { attributes: 1, tier: '第五层级/传说' },
  21: { attributes: 1, tier: '第六层级/神话' },
  25: { attributes: 1, tier: '第七层级/登神' },
} as const;

/** 职业等级经验表 - 各等级所需累计经验值 */
export const LevelXpTable: Readonly<Record<number, number | 'MAX'>> = {
  0: 0,
  1: 120,
  2: 360,
  3: 720,
  4: 1200,
  5: 2400,
  6: 3840,
  7: 5520,
  8: 7440,
  9: 11940,
  10: 16940,
  11: 22440,
  12: 28440,
  13: 38840,
  14: 50040,
  15: 62040,
  16: 74840,
  17: 100340,
  18: 127340,
  19: 155840,
  20: 185840,
  21: 236240,
  22: 289040,
  23: 344240,
  24: 401840,
  25: 'MAX',
} as const;

/** 核心游戏配置 */
export const GameConfig = {
  /** 1 金币 = 100 银币 */
  GpToSp: 100,
  /** 1 银币 = 100 铜币 */
  SpToCp: 100,
  /** 每多少级获得属性点 */
  ApAcquisitionLevel: 1,
  /** 登神长阶开启等级 */
  AscensionUnlockLevel: 13,
  /** 最大等级 */
  MaxLevel: 25,
} as const;

/** 五维属性键名 */
export const AttributeKeys = ['力量', '敏捷', '体质', '智力', '精神'] as const;
export type AttributeKey = (typeof AttributeKeys)[number];

/** 获取指定等级的里程碑数据 */
export const getMilestoneForLevel = (target_level: number): MilestoneBonus | undefined => {
  return MilestoneLevels[target_level];
};

/** 获取当前等级对应的生命层级 */
export const getTierForLevel = (target_level: number): string => {
  const validMilestones = _.chain(MilestoneLevels)
    .toPairs()
    .map(([lvl, data]) => ({ level: Number(lvl), data }))
    .filter(({ level: lvl }) => target_level >= lvl)
    .value();

  const highest = _.maxBy(validMilestones, 'level');
  return highest?.data.tier ?? '第一层级/普通';
};

/** 获取升级所需经验值 */
export const getRequiredXpForLevel = (target_level: number): number | 'MAX' => {
  return _.get(LevelXpTable, target_level, 'MAX');
};

/** 检查是否达到满级 */
export const isMaxLevel = (target_level: number): boolean => {
  return target_level >= GameConfig.MaxLevel;
};

/** HP 乘数表 - 各里程碑等级对应的 HP 乘数（低于此等级则取下一档） */
export const HpMultipliers: Readonly<Record<number, number>> = {
  1: 1,
  5: 2,
  9: 4,
  13: 10,
  17: 20,
  21: 40,
  25: 100,
} as const;

/** MP/SP 乘数表 - 各里程碑等级对应的 MP/SP 乘数（低于此等级则取下一档） */
export const MpSpMultipliers: Readonly<Record<number, number>> = {
  1: 1,
  5: 2.5,
  9: 6,
  13: 15,
  17: 35,
  21: 80,
  25: 160,
} as const;

/**
 * 在等级->乘数表中查找给定等级生效的乘数
 * 取不大于 level 的最高里程碑等级对应档位
 */
const lookupMultiplierByLevel = (
  table: Readonly<Record<number, number>>,
  level: number
): number => {
  const validLevels = _.chain(table)
    .keys()
    .map(Number)
    .filter(lvl => level >= lvl)
    .value();
  const highest = _.max(validLevels);
  return highest === undefined ? table[1] : table[highest];
};

/** 获取指定等级对应的 HP 乘数 */
export const getHpMultiplier = (level: number): number => {
  return lookupMultiplierByLevel(HpMultipliers, level);
};

/** 获取指定等级对应的 MP/SP 乘数 */
export const getMpSpMultiplier = (level: number): number => {
  return lookupMultiplierByLevel(MpSpMultipliers, level);
};

/** 获取所有里程碑等级（降序排列） */
export const getMilestoneLevelsDesc = (): number[] => {
  return _.chain(MilestoneLevels).keys().map(Number).sortBy().reverse().value();
};
