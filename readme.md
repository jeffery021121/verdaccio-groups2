# verdaccio-groups2

- 一个verdaccio group管理插件(auth插件)

> 使用方式

```yaml
# 在auth中定义group,注意是数组
auth:
  groups2:
   admin:
   - jack
   developer:
   - tom
     lily

# 在package中配置使用
packages:
  '**':
    access: developer
    publish: admin
    unpublish: admin
    proxy: npmjs
```
