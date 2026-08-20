import { calculateResourceLimits } from '../../src/services/resource-calculator';
import { buildVariables } from '../helpers';

describe('resource calculator', () => {
  describe('主角 (player) HP/MP/SP', () => {
    test('tier 一 (普通) base values', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 1,
            生命层级: '第一层级/普通',
            属性: { 力量: 5, 敏捷: 5, 体质: 5, 智力: 5, 精神: 5 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 体质 × 100 × 1 + 25 = 525
      // MP = (智力 + 精神) × 50 × 1 = 500
      // SP = (力量 + 敏捷) × 50 × 1 = 500
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(525);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(500);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(500);
    });

    test('tier 二 (中坚) multipliers', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 5,
            生命层级: '第二层级/中坚',
            属性: { 力量: 5, 敏捷: 5, 体质: 5, 智力: 5, 精神: 5 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 5 × 100 × 2 + 25 = 1025
      // MP = (5 + 5) × 50 × 2.5 = 1250
      // SP = (5 + 5) × 50 × 2.5 = 1250
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(1025);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(1250);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(1250);
    });

    test('tier 三 (精英) multipliers', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 9,
            生命层级: '第三层级/精英',
            属性: { 力量: 3, 敏捷: 7, 体质: 10, 智力: 6, 精神: 4 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 10 × 100 × 4 + 30 = 4030
      // MP = (6 + 4) × 50 × 6 = 3000
      // SP = (3 + 7) × 50 × 6 = 3000
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(4030);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(3000);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(3000);
    });

    test('tier 四 (史诗) multipliers', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 13,
            生命层级: '第四层级/史诗',
            属性: { 力量: 10, 敏捷: 8, 体质: 12, 智力: 8, 精神: 7 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 12 × 100 × 10 + 45 = 12045
      // MP = (8 + 7) × 50 × 15 = 11250
      // SP = (10 + 8) × 50 × 15 = 13500
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(12045);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(11250);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(13500);
    });

    test('tier 五 (传说) multipliers', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 17,
            生命层级: '第五层级/传说',
            属性: { 力量: 8, 敏捷: 8, 体质: 12, 智力: 10, 精神: 10 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 12 × 100 × 20 + 48 = 24048
      // MP = (10 + 10) × 50 × 35 = 35000
      // SP = (8 + 8) × 50 × 35 = 28000
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(24048);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(35000);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(28000);
    });

    test('tier 六 (神话) multipliers', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 21,
            生命层级: '第六层级/神话',
            属性: { 力量: 10, 敏捷: 10, 体质: 15, 智力: 12, 精神: 8 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 15 × 100 × 40 + 55 = 60055
      // MP = (12 + 8) × 50 × 80 = 80000
      // SP = (10 + 10) × 50 × 80 = 80000
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(60055);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(80000);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(80000);
    });

    test('tier 七 (登神) multipliers', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 25,
            生命层级: '第七层级/登神',
            属性: { 力量: 20, 敏捷: 20, 体质: 20, 智力: 20, 精神: 20 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 20 × 100 × 100 + 100 = 200100
      // MP = (20 + 20) × 50 × 160 = 320000
      // SP = (20 + 20) × 50 × 160 = 320000
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(200100);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(320000);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(320000);
    });

    test('falls back to getTierForLevel when 生命层级 is empty', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 5,
            生命层级: '',
            属性: { 力量: 5, 敏捷: 5, 体质: 5, 智力: 5, 精神: 5 },
          },
        },
      });

      calculateResourceLimits(variables);

      // Level 5 → '第二层级/中坚' → same as tier 二 test
      expect(variables.stat_data.主角.生命值.上限._基础).toBe(1025);
      expect(variables.stat_data.主角.法力值.上限._基础).toBe(1250);
      expect(variables.stat_data.主角.体力值.上限._基础).toBe(1250);
    });

    test('clamps current values exceeding new max', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 1,
            生命层级: '第一层级/普通',
            属性: { 力量: 1, 敏捷: 1, 体质: 1, 智力: 1, 精神: 1 },
            生命值: { 当前: 9999 },
            法力值: { 当前: 9999 },
            体力值: { 当前: 9999 },
          },
        },
      });

      calculateResourceLimits(variables);

      // HP = 1 × 100 × 1 + 5 = 105
      // MP = (1 + 1) × 50 × 1 = 100
      // SP = (1 + 1) × 50 × 1 = 100
      expect(variables.stat_data.主角.生命值.当前).toBe(105);
      expect(variables.stat_data.主角.法力值.当前).toBe(100);
      expect(variables.stat_data.主角.体力值.当前).toBe(100);
    });

    test('does not clamp current values below new max', () => {
      const variables = buildVariables({
        stat_data: {
          主角: {
            等级: 25,
            生命层级: '第七层级/登神',
            属性: { 力量: 20, 敏捷: 20, 体质: 20, 智力: 20, 精神: 20 },
            生命值: { 当前: 100 },
            法力值: { 当前: 50 },
            体力值: { 当前: 10 },
          },
        },
      });

      calculateResourceLimits(variables);

      expect(variables.stat_data.主角.生命值.当前).toBe(100);
      expect(variables.stat_data.主角.法力值.当前).toBe(50);
      expect(variables.stat_data.主角.体力值.当前).toBe(10);
    });
  });

  describe('NPC (关系列表) HP/MP/SP', () => {
    test('calculates NPC resources at tier 一', () => {
      const variables = buildVariables({
        stat_data: {
          关系列表: {
            艾莉丝: {
              等级: 1,
              生命层级: '第一层级/普通',
              属性: { 力量: 3, 敏捷: 3, 体质: 3, 智力: 3, 精神: 3 },
              在场: true,
            },
          },
        },
      });

      calculateResourceLimits(variables);

      const npc = variables.stat_data.关系列表['艾莉丝'];
      // HP = 3 × 100 × 1 + 15 = 315
      // MP = (3 + 3) × 50 × 1 = 300
      // SP = (3 + 3) × 50 × 1 = 300
      expect(npc.生命值.上限._基础).toBe(315);
      expect(npc.法力值.上限._基础).toBe(300);
      expect(npc.体力值.上限._基础).toBe(300);
    });

    test('initializes a new NPC with full resources', () => {
      const variables = buildVariables({
        stat_data: {
          关系列表: {
            '新 NPC': {
              等级: 1,
              生命层级: '第一层级/普通',
              属性: { 力量: 3, 敏捷: 3, 体质: 3, 智力: 3, 精神: 3 },
              生命值: { 当前: 500 },
              法力值: { 当前: 500 },
              体力值: { 当前: 500 },
              在场: true,
            },
          },
        },
      });
      const oldVariables = buildVariables();

      calculateResourceLimits(variables, oldVariables);

      const npc = variables.stat_data.关系列表['新 NPC'];
      expect(npc.生命值.当前).toBe(315);
      expect(npc.法力值.当前).toBe(300);
      expect(npc.体力值.当前).toBe(300);
    });

    test('refills an NPC when it becomes present', () => {
      const variables = buildVariables({
        stat_data: {
          关系列表: {
            '离场 NPC': {
              等级: 1,
              生命层级: '第一层级/普通',
              属性: { 力量: 3, 敏捷: 3, 体质: 3, 智力: 3, 精神: 3 },
              在场: true,
              生命值: { 当前: 1 },
              法力值: { 当前: 2 },
              体力值: { 当前: 3 },
            },
          },
        },
      });
      const oldVariables = buildVariables({
        stat_data: {
          关系列表: {
            '离场 NPC': {
              在场: false,
              生命值: { 当前: 1 },
              法力值: { 当前: 2 },
              体力值: { 当前: 3 },
            },
          },
        },
      });

      calculateResourceLimits(variables, oldVariables);

      const npc = variables.stat_data.关系列表['离场 NPC'];
      expect(npc.生命值.当前).toBe(315);
      expect(npc.法力值.当前).toBe(300);
      expect(npc.体力值.当前).toBe(300);
    });

    test('calculates NPC resources at tier 四', () => {
      const variables = buildVariables({
        stat_data: {
          关系列表: {
            贝恩: {
              等级: 13,
              生命层级: '第四层级/史诗',
              属性: { 力量: 8, 敏捷: 6, 体质: 10, 智力: 6, 精神: 5 },
              在场: true,
            },
          },
        },
      });

      calculateResourceLimits(variables);

      const npc = variables.stat_data.关系列表['贝恩'];
      // HP = 10 × 100 × 10 + 35 = 10035
      // MP = (6 + 5) × 50 × 15 = 8250
      // SP = (8 + 6) × 50 × 15 = 10500
      expect(npc.生命值.上限._基础).toBe(10035);
      expect(npc.法力值.上限._基础).toBe(8250);
      expect(npc.体力值.上限._基础).toBe(10500);
    });

    test('calculates NPC resources with empty 生命层级 via level fallback', () => {
      const variables = buildVariables({
        stat_data: {
          关系列表: {
            凯特: {
              等级: 9,
              生命层级: '',
              属性: { 力量: 5, 敏捷: 5, 体质: 5, 智力: 5, 精神: 5 },
              在场: true,
            },
          },
        },
      });

      calculateResourceLimits(variables);

      const npc = variables.stat_data.关系列表['凯特'];
      // Level 9 → '第三层级/精英' → HP mul=4, MP/SP mul=6
      // HP = 5 × 100 × 4 + 25 = 2025
      // MP = (5 + 5) × 50 × 6 = 3000
      // SP = (5 + 5) × 50 × 6 = 3000
      expect(npc.生命值.上限._基础).toBe(2025);
      expect(npc.法力值.上限._基础).toBe(3000);
      expect(npc.体力值.上限._基础).toBe(3000);
    });

    test('handles multiple NPCs independently', () => {
      const variables = buildVariables({
        stat_data: {
          关系列表: {
            战士: {
              等级: 1,
              生命层级: '第一层级/普通',
              属性: { 力量: 8, 敏捷: 2, 体质: 8, 智力: 1, 精神: 1 },
              在场: true,
            },
            法师: {
              等级: 5,
              生命层级: '第二层级/中坚',
              属性: { 力量: 1, 敏捷: 2, 体质: 2, 智力: 8, 精神: 7 },
              在场: true,
            },
          },
        },
      });

      calculateResourceLimits(variables);

      const warrior = variables.stat_data.关系列表['战士'];
      const mage = variables.stat_data.关系列表['法师'];

      // 战士: HP = 8×100×1 + 20 = 820, MP = (1+1)×50×1 = 100, SP = (8+2)×50×1 = 500
      expect(warrior.生命值.上限._基础).toBe(820);
      expect(warrior.法力值.上限._基础).toBe(100);
      expect(warrior.体力值.上限._基础).toBe(500);

      // 法师: HP = 2×100×2 + 20 = 420, MP = (8+7)×50×2.5 = 1875, SP = (1+2)×50×2.5 = 375
      expect(mage.生命值.上限._基础).toBe(420);
      expect(mage.法力值.上限._基础).toBe(1875);
      expect(mage.体力值.上限._基础).toBe(375);
    });

    test('clamps NPC current values exceeding new max', () => {
      const variables = buildVariables({
        stat_data: {
          关系列表: {
            受伤者: {
              等级: 1,
              生命层级: '第一层级/普通',
              属性: { 力量: 1, 敏捷: 1, 体质: 1, 智力: 1, 精神: 1 },
              生命值: { 当前: 500 },
              法力值: { 当前: 500 },
              体力值: { 当前: 500 },
              在场: true,
            },
          },
        },
      });

      calculateResourceLimits(variables);

      const npc = variables.stat_data.关系列表['受伤者'];
      // HP = 1×100×1 + 5 = 105, MP = 2×50×1 = 100, SP = 2×50×1 = 100
      expect(npc.生命值.当前).toBe(105);
      expect(npc.法力值.当前).toBe(100);
      expect(npc.体力值.当前).toBe(100);
    });
  });

  test('handles empty 关系列表 gracefully', () => {
    const variables = buildVariables();
    expect(() => calculateResourceLimits(variables)).not.toThrow();
    expect(variables.stat_data.主角.生命值.上限._基础).toBeDefined();
  });
});
