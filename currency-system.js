(function() {
    'use strict';
    
    /**
     * 货币系统模块 - 处理货币按需换算
     * @param {Object} property - 财产对象
     */
    function CurrencySystem(property) {
        let PP = window.safeParseFloat(property.货币.白金币); 
        let GP = window.safeParseFloat(property.货币.金币);   
        let SP = window.safeParseFloat(property.货币.银币);   
        let CP = window.safeParseFloat(property.货币.铜币);   
        
        // 按需换算函数
        function handleCurrencyExchange() {
            let deficit = 0;
            let currencyCleared = false;
            
            // PP购买处理：PP被扣成负时的换算逻辑
            if (PP < 0) {
                let ppDeficit = Math.abs(PP);
                
                // 优先用GP抵扣 (1PP = 100GP)
                if (GP >= ppDeficit * window.GAME_CONFIG.PP_TO_GP) {
                    GP -= ppDeficit * window.GAME_CONFIG.PP_TO_GP;
                    PP = 0;
                } else {
                    // GP不足，用完所有GP，剩余用SP换GP
                    let remainingDeficit = ppDeficit * window.GAME_CONFIG.PP_TO_GP - GP;
                    GP = 0;
                    
                    // 尝试用SP换GP (1GP = 10SP)
                    if (SP >= remainingDeficit * window.GAME_CONFIG.GP_TO_SP) {
                        SP -= remainingDeficit * window.GAME_CONFIG.GP_TO_SP;
                        PP = 0;
                    } else {
                        // SP不足，用完所有SP，剩余用CP换SP
                        remainingDeficit = remainingDeficit * window.GAME_CONFIG.GP_TO_SP - SP;
                        SP = 0;
                        
                        // 尝试用CP换SP (1SP = 10CP)
                        if (CP >= remainingDeficit * window.GAME_CONFIG.SP_TO_CP) {
                            CP -= remainingDeficit * window.GAME_CONFIG.SP_TO_CP;
                            PP = 0;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit * window.GAME_CONFIG.SP_TO_CP - CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
            // GP购买处理：GP被扣成负时的换算逻辑
            if (GP < 0 && !currencyCleared) {
                let gpDeficit = Math.abs(GP);
                
                // 优先用PP抵扣 (1PP = 100GP)
                if (PP >= Math.ceil(gpDeficit / window.GAME_CONFIG.PP_TO_GP)) {
                    let ppNeeded = Math.ceil(gpDeficit / window.GAME_CONFIG.PP_TO_GP);
                    PP -= ppNeeded;
                    GP = ppNeeded * window.GAME_CONFIG.PP_TO_GP - gpDeficit;
                } else {
                    // PP不足，用完所有PP，剩余用SP换GP
                    let remainingDeficit = gpDeficit - PP * window.GAME_CONFIG.PP_TO_GP;
                    PP = 0;
                    
                    // 尝试用SP换GP (1GP = 10SP)
                    if (SP >= remainingDeficit * window.GAME_CONFIG.GP_TO_SP) {
                        SP -= remainingDeficit * window.GAME_CONFIG.GP_TO_SP;
                        GP = 0;
                    } else {
                        // SP不足，用完所有SP，剩余用CP换SP
                        remainingDeficit = remainingDeficit * window.GAME_CONFIG.GP_TO_SP - SP;
                        SP = 0;
                        
                        // 尝试用CP换SP (1SP = 10CP)
                        if (CP >= remainingDeficit * window.GAME_CONFIG.SP_TO_CP) {
                            CP -= remainingDeficit * window.GAME_CONFIG.SP_TO_CP;
                            GP = 0;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit * window.GAME_CONFIG.SP_TO_CP - CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
            // SP购买处理：SP被扣成负时的换算逻辑
            if (SP < 0 && !currencyCleared) {
                let spDeficit = Math.abs(SP);
                
                // 优先用PP抵扣 (1PP = 1000SP)
                if (PP >= Math.ceil(spDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP))) {
                    let ppNeeded = Math.ceil(spDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP));
                    PP -= ppNeeded;
                    SP = ppNeeded * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP - spDeficit;
                } else {
                    // PP不足，用完所有PP，剩余用GP换SP
                    let remainingDeficit = spDeficit - PP * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP;
                    PP = 0;
                    
                    // 尝试用GP换SP (1GP = 10SP)
                    if (GP >= Math.ceil(remainingDeficit / window.GAME_CONFIG.GP_TO_SP)) {
                        let gpNeeded = Math.ceil(remainingDeficit / window.GAME_CONFIG.GP_TO_SP);
                        GP -= gpNeeded;
                        SP = gpNeeded * window.GAME_CONFIG.GP_TO_SP - remainingDeficit;
                    } else {
                        // GP不足，用完所有GP，剩余用CP换SP
                        remainingDeficit = remainingDeficit - GP * window.GAME_CONFIG.GP_TO_SP;
                        GP = 0;
                        
                        // 尝试用CP换SP (1SP = 10CP)
                        if (CP >= remainingDeficit * window.GAME_CONFIG.SP_TO_CP) {
                            CP -= remainingDeficit * window.GAME_CONFIG.SP_TO_CP;
                            SP = 0;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit * window.GAME_CONFIG.SP_TO_CP - CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
            // CP购买处理：CP被扣成负时的换算逻辑
            if (CP < 0 && !currencyCleared) {
                let cpDeficit = Math.abs(CP);
                
                // 优先用PP抵扣 (1PP = 10000CP)
                if (PP >= Math.ceil(cpDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP))) {
                    let ppNeeded = Math.ceil(cpDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP));
                    PP -= ppNeeded;
                    CP = ppNeeded * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP - cpDeficit;
                } else {
                    // PP不足，用完所有PP，剩余用GP换CP
                    let remainingDeficit = cpDeficit - PP * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP;
                    PP = 0;
                    
                    // 尝试用GP换CP (1GP = 100CP)
                    if (GP >= Math.ceil(remainingDeficit / (window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP))) {
                        let gpNeeded = Math.ceil(remainingDeficit / (window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP));
                        GP -= gpNeeded;
                        CP = gpNeeded * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP - remainingDeficit;
                    } else {
                        // GP不足，用完所有GP，剩余用SP换CP
                        remainingDeficit = remainingDeficit - GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP;
                        GP = 0;
                        
                        // 尝试用SP换CP (1SP = 10CP)
                        if (SP >= Math.ceil(remainingDeficit / window.GAME_CONFIG.SP_TO_CP)) {
                            let spNeeded = Math.ceil(remainingDeficit / window.GAME_CONFIG.SP_TO_CP);
                            SP -= spNeeded;
                            CP = spNeeded * window.GAME_CONFIG.SP_TO_CP - remainingDeficit;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit - SP * window.GAME_CONFIG.SP_TO_CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
            return { deficit, currencyCleared };
        }
        
        // 执行按需换算
        const result = handleCurrencyExchange();
        
        // 处理无法覆盖的情况
        if (result.currencyCleared && result.deficit > 0) {
            window.injectPrompts([{
                id: 'currency_deficit',
                content: `core_system:warning {{user}}货币不足,差值为${result.deficit}铜币,你需要通过红线系统助手提醒{{user}}并提醒{{user}}即使偿还`,
                position: 'in_chat',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);
        }
        
        // 更新货币值
        property.货币.白金币 = Math.max(0, Math.floor(PP));
        property.货币.金币 = Math.max(0, Math.floor(GP));
        property.货币.银币 = Math.max(0, Math.floor(SP));
        property.货币.铜币 = Math.floor(CP); // CP可以为负数，表示欠债
    }

    // 将函数暴露给全局范围
    window.CurrencySystem = CurrencySystem;
})();
