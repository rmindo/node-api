module.exports = {
  resource: [
    {
      users: {
        var: ':id',
        extra: [
          ['GET', '/init', 'init', true]
        ]
      },
      contacts: {
        pass: true,
        var: ':key'
      },
      addresses: {
        var: ':index'
      }
    },
  ]
};