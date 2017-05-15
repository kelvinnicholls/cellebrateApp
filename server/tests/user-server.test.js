const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  ObjectID
} = require('mongodb');

const {
  app
} = require('./../server');
const {
  User,
  seed
} = require('./../models/user');

const {
  populateUsers,
  users
} = require('./seed');

beforeEach(populateUsers);

describe('GET /users/me', () => {

  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set({
        'x-auth': 'xx'
      })
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

});


describe('GET /users/', () => {

  it('should return all user\s if admin user', (done) => {
    request(app)
      .get('/users')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(2);
      })
      .end(done);
  });

  it('should return current user if not admin user', (done) => {
    request(app)
      .get('/users')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
      })
      .end(done);
  });


  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users')
      .set({
        'x-auth': 'xx'
      })
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

});



describe('POST /users', () => {
  it('should create a user if admin user', (done) => {
    let email = 'email3@email.com';
    let password = 'email3.password';

    let name = "Kelvin";
    let adminUser = true;
    let relationship = "Son";
    let dob = 2342323;
    let user = {
      email,
      password,
      name,
      adminUser,
      relationship,
      dob
    };
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
        let access = 'auth';

        let token = jwt.sign({
          _id: res.body._id,
          access
        }, seed).toString();
        expect(res.body._id).toExist();
        // expect(res.headers['x-auth']).toExist(); only available on login now

      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          email
        }).then((user) => {
          expect(user).toExist();
          expect(user.email).toBe(email);
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a user if not admin user', (done) => {
    let email = 'email3@email.com';
    let password = 'email3.password';

    let name = "Kelvin";
    let adminUser = true;
    let relationship = "Son";
    let dob = 2342323;
    let user = {
      email,
      password,
      name,
      adminUser,
      relationship,
      dob
    };
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .send(user)
      .expect(401)
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          email
        }).then((user) => {
          expect(user).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });


  it('should return validation errors if request invalid', (done) => {
    let email = 'email4.email.com';
    let password = 'email4.password';
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should not create a user if email in use', (done) => {
    let email = users[0].email;
    let password = users[0].password;
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should not create a user if name in use', (done) => {
    let name = users[0].name;
    let email = 'email5.email.com';
    let password = 'email5.password';
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        email,
        password,
        name
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});


describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    let email = users[1].email;
    let password = users[1].password;
    request(app)
      .post('/users/login')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(users[1].email);
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login (password)', (done) => {
    let email = users[1].email;
    let password = users[1].password + "x";
    request(app)
      .post('/users/login')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login (email)', (done) => {
    let email = users[1].email + "x";
    let password = users[1].password;
    request(app)
      .post('/users/login')
      .send({
        email,
        password
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end(done);
  });
});


describe('DELETE /users/me/token', () => {

  it('should remove auth token on logout', (done) => {
    let email = users[0].email;
    let password = users[0].password;
    request(app)
      .delete('/users/me/token')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({});
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

});

describe('UPDATE /users/:id', () => {

  it('should update user for id if id for logged in user', (done) => {
    let user = users[1];
    let oldName = users[1].name;
    let newName = users[1].name + ' UPDATED';
    user.name = newName;
    let id = users[1].tokens[0].token;
    request(app)
      .patch('/users/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(newName);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findByToken(id).then((user) => {

          expect(user.name).toBe(newName);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should update user if logged in as admin and user is not you', (done) => {
    let user = users[1];
    let oldName = users[1].name;
    let newName = users[1].name + ' UPDATED';
    user.name = newName;
    let id = users[1].tokens[0].token;
    request(app)
      .patch('/users/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(newName);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findByToken(id).then((user) => {
          expect(user.name).toBe(newName);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not update user for id not owned and not admin', (done) => {
    let user = users[0];
    let oldName = users[0].name;
    let newName = users[0].name + ' UPDATED';
    user.name = newName;
    let id = users[0].tokens[0].token;
    request(app)
      .patch('/users/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .send(user)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findByToken(id).then((user) => {
          expect(user.name).toBe(oldName);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should  update user for id not owned but admin', (done) => {
    let user = users[1];
    let oldName = users[1].name;
    let newName = users[1].name + ' UPDATED';
    user.name = newName;
    let id = users[1].tokens[0].token;
    request(app)
      .patch('/users/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(user)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(newName);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findByToken(id).then((id) => {
          expect(user.name).toBe(newName);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should return 401 if token found', (done) => {
    let user = users[0];
    let oldName = users[0].name;
    let newName = users[0].name + ' UPDATED';
    user.name = newName;
    let id = new ObjectID().toHexString();
    request(app)
      .patch('/users/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(user)
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe(undefined);
      })
      .end(done);
  });

});