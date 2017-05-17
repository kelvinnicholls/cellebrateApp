const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


const {
  ObjectID
} = require('mongodb');

const {
  app
} = require('./../server');
const {
  Memory
} = require('./../models/memory');

const {
  populateMemories,
  memories,
  populateMedias,
  medias,
  populateUsers,
  users
} = require('./seed');

beforeEach(populateUsers);
beforeEach(populateMedias);
beforeEach(populateMemories);

describe('GET /memories', () => {
  it('should get all memories for admin user', (done) => {
    request(app)
      .get('/memories')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.memories.length).toBe(2);
      })
      .end(done);
  });

  it('should get only user\'s memories for non-admin user', (done) => {
    request(app)
      .get('/memories')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.memories.length).toBe(1);
      })
      .end(done);
  });
});


describe('GET /memories/:id', () => {
  it('should get memory for id', (done) => {
    let id = memories[0]._id.toHexString();
    request(app)
      .get('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.memory._id).toBe(id);
        expect(res.body.memory.users[0]).toBe(users[0].name);
        expect(res.body.memory.users[1]).toBe(users[1].name);
      })
      .end(done);
  });

  it('should return 404 if memory not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .get('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("memory not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .get('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Memory ID is invalid");
      })
      .end(done);
  });
});

describe('POST /memory', () => {
  it('should create a new memory', (done) => {
    let memory = {
      title: 'Memory 3',
      description: 'Memory 3',
      memoryDate: 64567577656,
      tags: ["tag10", "tag11"],
      users: [users[1].name],
      medias: [medias[0]._id]
    };

    request(app)
      .post('/memory')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(memory)
      .expect(200)
      .expect((res) => {
        expect(res.body.description).toBe(memory.description);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Memory.findOne({
          description: memory.description
        }).then((dbMemory) => {
          expect(dbMemory).toExist();
          expect(dbMemory.addedDate).toExist();
          expect(dbMemory._creator).toExist();
          expect(dbMemory.description).toBe(memory.description);
          expect(new ObjectID(dbMemory.users[0])).toEqual(users[1]._id);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create memory with invalid body data', (done) => {
    request(app)
      .post('/memory')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Memory.find().then((memories) => {
          expect(memories.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});


describe('DELETE /memories', () => {
  it('should delete all memories if admin user', (done) => {
    request(app)
      .delete('/memories')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.memories.n).toBe(2);
      })
      .end(done);
  });

  it('should delete only user\'s memories if not admin user', (done) => {
    request(app)
      .delete('/memories')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.memories.n).toBe(1);
      })
      .end(done);
  });
});

describe('DELETE /memories/:id', () => {
  it('should delete memory for id', (done) => {
    let id = memories[0]._id.toHexString();
    request(app)
      .delete('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.memory._id).toBe(id);
        expect(res.body.memory.description).toBe(memories[0].description);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Memory.findById(id).then((memory) => {
          expect(memory).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should delete memory for id for admin user', (done) => {
    let id = memories[1]._id.toHexString();
    request(app)
      .delete('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.memory._id).toBe(id);
        expect(res.body.memory.description).toBe(memories[1].description);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Memory.findById(id).then((memory) => {
          expect(memory).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should not delete memory for id for non-admin user', (done) => {
    let id = memories[0]._id.toHexString();
    request(app)
      .delete('/memories/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Memory.findById(id).then((memory) => {
          expect(memory).toExist();
          done();
        }).catch((e) => done(e));

      });
  });



  it('should return 404 if memory not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .delete('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("memory not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .delete('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Memory ID is invalid");
      })
      .end(done);
  });


});

describe('UPDATE /memories/:id', () => {


  it('should update memory for id', (done) => {
    let memory = _.clone(memories[0]);
    let oldDescription = memory.description;
    let newDescription = memory.description + ' UPDATED';
    memory.description = newDescription;
    let id = memories[0]._id.toHexString();
    request(app)
      .patch('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(memory)
      .expect(200)
      .expect((res) => {
        expect(res.body.memory._id).toBe(id);
        expect(res.body.memory.description).toBe(newDescription);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Memory.findById(id).then((memory) => {
          expect(memory.description).toBe(newDescription);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should not update memory for id not owned and not admin', (done) => {
    
    let memory = _.clone(memories[0]);
    let oldDescription = memory.description;
    let newDescription = memory.description + ' UPDATED';
    memory.description = newDescription;
    let id = memory._id.toHexString();
    request(app)
      .patch('/memories/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .send(memory)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Memory.findById(id).then((memory) => {
          expect(memory.description).toBe(oldDescription);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should  update memory for id not owned but admin', (done) => {
    let memory = _.clone(memories[1]);
    let oldDescription = memory.description;
    let newDescription = memory.description + ' UPDATED';
    memory.description = newDescription;
    let id = memory._id.toHexString();
    request(app)
      .patch('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(memory)
      .expect(200)
      .expect((res) => {
        expect(res.body.memory._id).toBe(id);
        expect(res.body.memory.description).toBe(newDescription);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Memory.findById(id).then((memory) => {
          expect(memory.description).toBe(newDescription);
          done();
        }).catch((e) => done(e));

      });
  });



  it('should return 404 if memory not found', (done) => {
    let memory = _.clone(memories[0]);
    let oldDescription = memory.description;
    let newDescription = memory.description + ' UPDATED';
    memory.description = newDescription;
    let id = new ObjectID().toHexString();
    request(app)
      .patch('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(memory)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("memory not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let memory = _.clone(memories[0]);
    let oldDescription = memory.description;
    let newDescription = memory.description + ' UPDATED';
    memory.description = newDescription;
    let id = 'x';
    request(app)
      .patch('/memories/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(memory)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Memory ID is invalid");
      })
      .end(done);
  });
});