(function() {
    'use strict';
    
    /**
     * 属性校准模块 - 计算HP、MP、SP
     * @param {Object} user - 用户对象
     */
    function attributecalibration(user) {
        // 获取基础属性值
        const LV = window.safeParseFloat(user.状态.等级[0]);
        const CON = window.safeParseFloat(user.属性.体质[0]);
        const INT = window.safeParseFloat(user.属性.智力[0]);
        const SPI = window.safeParseFloat(user.属性.精神[0]);
        const AGI = window.safeParseFloat(user.属性.敏捷[0]);
        const STR = window.safeParseFloat(user.属性.力量[0]);
        
        // 获取倍率
        const HPmagnification = window.safeParseFloat(user.资源.生命倍率[0]) || 1;
        const MPmagnification = window.safeParseFloat(user.资源.法力倍率[0]) || 1;
        const SPmagnification = window.safeParseFloat(user.资源.体力倍率[0]) || 1;
        
        // 获取额外属性值 (EHP: Extra Health Points)
        const EHP = window.safeParseFloat(user.资源.额外生命上限[0]) || 0;
        const EMP = window.safeParseFloat(user.资源.额外法力上限[0]) || 0;
        const ESP = window.safeParseFloat(user.资源.额外体力上限[0]) || 0;
        
        // 计算基础属性值 (BHP: Base Health Points)
        const BHP = CON * window.GAME_CONFIG.CON_TO_Attribute + LV * window.GAME_CONFIG.LV_TO_Attribute;
        const BMP = INT * window.GAME_CONFIG.INT_TO_Attribute + SPI * window.GAME_CONFIG.SPI_TO_Attribute + LV * window.GAME_CONFIG.LV_TO_Attribute;
        const BSP = STR * window.GAME_CONFIG.STR_TO_Attribute + AGI * window.GAME_CONFIG.AGI_TO_Attribute + LV * window.GAME_CONFIG.LV_TO_Attribute;
        
        // 设置基础属性上限
        user.资源.基础生命值上限[0] = BHP;
        user.资源.基础法力值上限[0] = BMP;
        user.资源.基础体力值上限[0] = BSP;
        
        // 计算最终属性上限（基础值 + 额外值) * 倍率
        user.资源.生命值上限[0] = (BHP + EHP) * HPmagnification;
        user.资源.法力值上限[0] = (BMP + EMP) * MPmagnification;
        user.资源.体力值上限[0] = (BSP + ESP) * SPmagnification;
        
        // 确保当前值不超过上限
        user.资源.生命值[0] = Math.min(user.资源.生命值[0], user.资源.生命值上限[0]);
        user.资源.法力值[0] = Math.min(user.资源.法力值[0], user.资源.法力值上限[0]);
        user.资源.体力值[0] = Math.min(user.资源.体力值[0], user.资源.体力值上限[0]);
    }

    // 将函数暴露给全局范围
    window.attributecalibration = attributecalibration;
})();
