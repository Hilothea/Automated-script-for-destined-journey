(function() {
    'use strict';
    
    /**
     * 事件链处理模块
     * @param {Object} eventchain - 事件链对象
     */
    function event_chain(eventchain) {
        if (eventchain.开启 === 'true') {
            eventchain.开启 = true
        }
        if (eventchain.开启 === 'false') {
            eventchain.开启 = false
        }
        if (eventchain.结束 === 'true') {
            eventchain.结束 = true
        }
        if (eventchain.结束 === 'false') {
            eventchain.结束 = false
        }
        if (eventchain.开启 === true) {
            // 清除之前的事件链注入
            uninjectPrompts(['event_chain']);
            uninjectPrompts(['event_chain_tips']);
            
            const title = eventchain.标题;
            const step = eventchain.大狗叫;
            
            // 注入当前事件链状态
            injectPrompts([{
                id: 'event_chain',
                content: `当前事件为${title}，当前步骤为${step}`,
                position: 'none',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);
            
            // 注入事件链激活提示
            injectPrompts([{
                id: 'event_chain_tips',
                content: `core_system:事件链${title}已激活,注意<event_chain>`,
                position: 'in_chat',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);
            
            // 检查是否结束事件链
            if (eventchain.结束 === true) {
                uninjectPrompts(['event_chain']);
                uninjectPrompts(['event_chain_tips']);
                eventchain.标题 = 'null';
                eventchain.大狗叫 = 'null';
                eventchain.结束 = false;
                eventchain.开启 = false;
            }
        }
    }
    // 将函数暴露给全局范围
    window.event_chain = event_chain;
})();
