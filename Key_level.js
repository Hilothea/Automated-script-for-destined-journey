(function() {
    'use strict';
    function Key_level(user) {
        if(user.状态.等级[0] >= 60){
        injectPrompts([{
            id: 'Key_level',
            position: 'none',
            role: 'system',
            depth: 0,
            content: 'user_lv>=60',
            should_scan: true
        }]);
        }
    }
    window.Key_level = Key_level;
})();
