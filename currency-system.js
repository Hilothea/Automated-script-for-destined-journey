(function() {
    'use strict';
    
    /**
     * 货币系统模块 - 处理货币换算
     * @param {Object} property - 财产对象
     */
    function CurrencySystem(property) {
        let PP = window.safeParseFloat(property.货币.白金币[0]); 
        let GP = window.safeParseFloat(property.货币.金币[0]);   
        let SP = window.safeParseFloat(property.货币.银币[0]);   
        let CP = window.safeParseFloat(property.货币.铜币[0]);   
        
        // 计算总铜币数
        let totalCopper = PP * window.GAME_CONFIG.PP_TO_CP + GP * window.GAME_CONFIG.GP_TO_CP + SP * window.GAME_CONFIG.SP_TO_CP + CP;
        
        // 处理负数情况
        if (totalCopper < 0) {
            totalCopper = 0;
            alert('牢希提醒您,您破产拉!'); 
            injectPrompts([{
                id: 'property_error',
                content: `core_system:warning {{user}}Currency variable abnormal, now reset to zero`,
                position: 'in_chat',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);
        }
        
        // 将总铜币转换为各种货币
        PP = Math.floor(totalCopper / window.GAME_CONFIG.PP_TO_CP);
        totalCopper = totalCopper % window.GAME_CONFIG.PP_TO_CP;
        
        GP = Math.floor(totalCopper / window.GAME_CONFIG.GP_TO_CP);
        totalCopper = totalCopper % window.GAME_CONFIG.GP_TO_CP;
        
        SP = Math.floor(totalCopper / window.GAME_CONFIG.SP_TO_CP);
        CP = Math.floor(totalCopper % window.GAME_CONFIG.SP_TO_CP);
        
        // 更新货币值
        property.货币.白金币[0] = PP;
        property.货币.金币[0] = GP;
        property.货币.银币[0] = SP;
        property.货币.铜币[0] = CP;
    }

    // 将函数暴露给全局范围
    window.CurrencySystem = CurrencySystem;
})();
