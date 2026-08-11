import merge from 'lodash/merge';
import type { MessageVariables } from '../src/types';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const buildVariables = (overrides: DeepPartial<MessageVariables> = {}): MessageVariables => {
  const base: MessageVariables = {
    stat_data: {
      事件: {},
      世界: { 时间: '', 地点: '' },
      任务列表: {},
      主角: {
        等级: 1,
        累计经验值: 0,
        升级所需经验: 120,
        冒险者等级: '',
        生命值: 0,
        生命值上限: 0,
        法力值: 0,
        法力值上限: 0,
        体力值: 0,
        体力值上限: 0,
        属性点: 0,
        金钱: 0,
        背包: {},
        资产: {},
        状态效果: {},
        种族: '',
        身份: [],
        职业: [],
        生命层级: '',
        属性: {
          力量: 0,
          敏捷: 0,
          体质: 0,
          智力: 0,
          精神: 0,
        },
        装备: {},
        技能: {},
        登神长阶: {
          是否开启: false,
          要素: {},
          权能: {},
          法则: {},
          神位: '',
          神国: { 名称: '', 描述: '' },
        },
      },
      命运点数: 0,
      关系列表: {},
      新闻: {
        阿斯塔利亚快讯: {
          势力要闻: '',
          尊位行迹: '',
          军事行动: '',
          经济动脉: '',
          灾害预警: '',
        },
        酒馆留言板: {
          高额悬赏: '',
          冒险发现: '',
          怪物异动: '',
          通缉要犯: '',
          宝物传闻: '',
        },
        午后茶会: {
          社交逸闻: '',
          千里远望: '',
          命运涟漪: '',
          邂逅预兆: '',
        },
      },
    },
    date: {
      event: { cache: '', completed_events: [] },
      npcs: {},
      npcLevelUpWithPlayer: true,
      requiresContractForExp: true,
      ascensionLawReady: false,
      log: {
        deathCount: 0,
        maxCurrencyDebt: 0,
        bankruptcyCount: 0,
        illegalLevelUpId: [],
        totalFPGained: 0,
        timeRecord: {},
        locationRecord: {},
      },
    },
  };

  return merge({}, base, overrides) as MessageVariables;
};
