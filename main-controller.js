(function() {
    'use strict';
    
    /**
     * 主流程控制函数
     * @param {Object} variables - 包含所有游戏数据的变量对象
     */
    function Main_processes(variables) {
        // 获取变量
        const user = variables.stat_data?.角色; 
        const property = variables?.stat_data?.财产; 
        const world = variables?.stat_data?.世界; 
        const eventchain = variables.stat_data?.事件链;
        
        if (!user || !property || !world ||!eventchain) {
            console.error("Core data missing, script terminated");
            return;
        }
        
        // 按照顺序执行模块
        window.uninject();                           // 1. 解除注入
        window.experiencegrowth(user);               // 2. 经验与等级处理
        window.CurrencySystem(property);             // 3. 货币换算
        window.inforead(world);                      // 4. 信息读取与注入
        window.event_chain(eventchain);              // 6. 事件链处理
        window.Key_level(user);                      //7.关键等级检测
    }

    // 将主函数暴露给全局范围
    window.Main_processes = Main_processes;

    // ============================ [事件监听] ============================
    // 监听变量更新完成事件
    eventOn('mag_variable_update_ended', Main_processes);
    
    // 监听按钮事件
    eventOnButton('重新处理变量', Main_processes);
})();
