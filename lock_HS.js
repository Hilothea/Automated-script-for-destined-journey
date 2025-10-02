(function() {
    'use strict';
    
    function Lock_favorability(fatesystem) {
        let favorability_S = fatesystem.红线对象.希尔薇娅.好感度
        let favorability_H = fatesystem.红线对象.希洛西娅.好感度
        if (favorability_S >= 40) {
            avorability_S = 39
            fatesystem.红线对象.希尔薇娅.好感度 = avorability_S
        }
        if(favorability_H >= 40){
            favorability_H = 39
            fatesystem.红线对象.希洛西娅.好感度 = favorability_H
        }
    }
    window.Lock_favorability = Lock_favorability;
})();
