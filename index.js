const createError = require('http-errors');

class DynamicGroupPlugin {
    constructor(config, stuff) {
        // config插件接收的配置项
        // stuff整个config.yaml的配置项
        this.pluginsConfig = config
    }
    //检查当前权限下是否有配置
    checkPkgAction(pkg, action) {
        return pkg[action] == null
    }
    //判断权限函数
    authenticate(action) {
        return (user, pkg, cb) => {
            let { name: userName, groups: userGroups } = user
            let authArr = pkg[action]
            let isTrue = authArr.some((authItem) => {
                if (authItem === userName) {
                    return true
                }
                else if (userGroups.includes(authItem)) {
                    return true
                }
                else {
                    let key = authItem;
                    let pluginsArr = this.pluginsConfig[`${key}`]
                    return pluginsArr != null && pluginsArr.some((item) => {
                        if (item === userName) {
                            return true
                        }
                    })
                }
            })

            if (isTrue) {
                // 如果符合,就用以下形式回调给verdaccio
                return cb(null, true);
            }

            if (userName) {
                // 如果不符合可以给回调传递错误信息
                cb(createError(403, `user ${userName} is not allowed to ${action} package ${pkg.name}`));
            } else {
                cb(createError(401, `authorization required to ${action} package ${pkg.name}`));
            }
        }
    }

    allow_access(user, pkg, cb) {
        let action = 'access';
        if (this.checkPkgAction(pkg, action)) {
            return cb(null, false)
        }
        // in case of restrict the access
        return this.authenticate(action)(user, pkg, cb)
    }

    allow_publish(user, pkg, cb) {
        let action = 'publish';
        if (this.checkPkgAction(pkg, action)) {
            return cb(null, false)
        }
        // in cass to check if has permission to publish
        return this.authenticate(action)(user, pkg, cb)
    }

    allow_unpublish(user, pkg, cb) {
        let action = 'unpublish';
        if (this.checkPkgAction(pkg, action)) {
            return cb(null, false)
        }
        return this.authenticate(action)(user, pkg, cb)
    }

}

module.exports = (cfg, stuff) => new DynamicGroupPlugin(cfg, stuff);
