(function() {
    'use strict';
    
    /**
     * 信息读取与注入模块
     * @param {Object} world - 世界对象
     */
    function inforead(world) {
        // 注入地点信息
        injectPrompts([{
            id: 'Location',
            content: world.地点,
            position: 'none',
            depth: 0,
            role: 'system',
            should_scan: true,
        }]);
        
        // 注入时间信息
        injectPrompts([{
            id: 'Time',
            content: world.时间,
            position: 'none',
            depth: 0,
            role: 'system',
            should_scan: true,
        }]);
    }

    // 将函数暴露给全局范围
    window.inforead = inforead;
})();
