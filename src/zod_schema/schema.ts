import {
  clampedMum,
  IdentitySchema,
  InventoryItemSchema,
  minLimitedNum,
  StatusEffectSchema,
  TaskSchema,
} from './utils';

const assets = z
  .record(
    z.string(),
    z
      .object({
        品质: z.string().prefault(''),
        类型: z.string().prefault(''),
        结算: z.string().prefault(''),
        标签: z.array(z.string()).prefault([]).transform(_.uniq),
        效果: z.record(z.string(), z.string()).prefault({}),
        描述: z.string().prefault(''),
      })
      .prefault({})
  )
  .prefault({});

/**
 * 玩家信息
 */
const player = z
  .object({
    ...IdentitySchema.shape,
    累计经验值: z.coerce.number().prefault(0),
    升级所需经验: z.union([z.coerce.number().prefault(120), z.literal('MAX')]),
    冒险者等级: z.string().prefault('未评级'),
    生命值: z.coerce.number().prefault(0),
    生命值上限: z.coerce.number().prefault(0),
    法力值: z.coerce.number().prefault(0),
    法力值上限: z.coerce.number().prefault(0),
    体力值: z.coerce.number().prefault(0),
    体力值上限: z.coerce.number().prefault(0),
    属性点: z.coerce.number().prefault(0),
    背包: z
      .record(z.string(), InventoryItemSchema)
      .prefault({})
      .transform(items => _.pickBy(items, item => item.数量 > 0)),
    资产: assets,
    金钱: z.coerce.number().prefault(0).transform(Math.round),
    状态效果: z.record(z.string(), StatusEffectSchema).prefault({}),
  })
  .prefault({})
  .transform(data => {
    const processed = {
      ...data,
      升级所需经验: data.等级 >= 25 ? 'MAX' : data.升级所需经验,
      生命值: _.clamp(data.生命值, 0, data.生命值上限),
      法力值: _.clamp(data.法力值, 0, data.法力值上限),
      体力值: _.clamp(data.体力值, 0, data.体力值上限),
    };

    return _.pick(processed, [
      // 基础信息
      '种族',
      '身份',
      '职业',
      '生命层级',
      // 等级系统
      '等级',
      '累计经验值',
      '升级所需经验',
      '冒险者等级',
      // 属性点（在属性前面）
      '属性点',
      // 属性
      '属性',
      // 资源值
      '生命值上限',
      '生命值',
      '法力值上限',
      '法力值',
      '体力值上限',
      '体力值',
      // 状态效果
      '状态效果',
      // 物品与金钱
      '金钱',
      '背包',
      '资产',
      // 装备、技能、登神长阶
      '装备',
      '技能',
      '登神长阶',
    ]);
  });

/**
 * 关系列表信息
 */
const partners = z
  .record(
    z.string(),
    z
      .object({
        ...IdentitySchema.shape,
        在场: z.boolean().prefault(false),
        性格: z.string().prefault(''),
        喜爱: z.string().prefault(''),
        外貌: z.string().prefault(''),
        着装: z.string().prefault(''),
        生命值: z.coerce.number().prefault(0),
        生命值上限: z.coerce.number().prefault(0),
        法力值: z.coerce.number().prefault(0),
        法力值上限: z.coerce.number().prefault(0),
        体力值: z.coerce.number().prefault(0),
        体力值上限: z.coerce.number().prefault(0),
        命定契约: z.boolean().prefault(false),
        好感度: clampedMum(0, -100, 100),
        状态效果: z.record(z.string(), StatusEffectSchema).prefault({}),
        背包: z
          .record(z.string(), InventoryItemSchema)
          .prefault({})
          .transform(items => _.pickBy(items, item => item.数量 > 0)),
        资产: assets,
        心里话: z.string().prefault(''),
        背景故事: z.string().prefault(''),
      })
      .prefault({})
      .transform(data => {
        const processed = {
          ...data,
          生命值: _.clamp(data.生命值, 0, data.生命值上限),
          法力值: _.clamp(data.法力值, 0, data.法力值上限),
          体力值: _.clamp(data.体力值, 0, data.体力值上限),
        };

        return _.pick(processed, [
          // 状态信息
          '在场',
          // 基础信息
          '种族',
          '身份',
          '职业',
          '生命层级',
          // 外貌特征
          '性格',
          '喜爱',
          '外貌',
          '着装',
          // 等级
          '等级',
          // 资源值
          '生命值上限',
          '生命值',
          '法力值上限',
          '法力值',
          '体力值上限',
          '体力值',
          // 属性
          '属性',
          '状态效果',
          // 物品
          '背包',
          '资产',
          // 装备、技能、登神长阶
          '装备',
          '技能',
          '登神长阶',
          // 关系信息
          '命定契约',
          '好感度',
          // 故事信息
          '心里话',
          '背景故事',
        ]);
      })
  )
  .prefault({});

/**
 * 新闻信息
 */
const news = z.object({
  阿斯塔利亚快讯: z
    .object({
      势力要闻: z.string().prefault(''),
      尊位行迹: z.string().prefault(''),
      军事行动: z.string().prefault(''),
      经济动脉: z.string().prefault(''),
      灾害预警: z.string().prefault(''),
    })
    .prefault({}),
  酒馆留言板: z
    .object({
      高额悬赏: z.string().prefault(''),
      冒险发现: z.string().prefault(''),
      怪物异动: z.string().prefault(''),
      通缉要犯: z.string().prefault(''),
      宝物传闻: z.string().prefault(''),
    })
    .prefault({}),
  午后茶会: z
    .object({
      社交逸闻: z.string().prefault(''),
      千里远望: z.string().prefault(''),
      命运涟漪: z.string().prefault(''),
      邂逅预兆: z.string().prefault(''),
    })
    .prefault({}),
});

export const Schema = z.object({
  事件: z.record(z.any(), z.any()).prefault({}),
  世界: z
    .object({
      时间: z.string().prefault(''),
      地点: z.string().prefault(''),
    })
    .prefault({}),
  任务列表: z.record(z.string(), TaskSchema).prefault({}),
  主角: player.prefault({}),
  命运点数: minLimitedNum(0, 0),
  关系列表: partners,
  新闻: news.prefault({}),
});
