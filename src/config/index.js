module.exports = {
  resource: [
    {
      users: {
        var: 'string:id',
        extra: [
          ['GET', '/init', 'init', true]
        ]
      },
      contacts: {
        pass: true,
        var: 'string:key'
      },
      addresses: {
        var: 'string:index'
      }
    },
  ]
};