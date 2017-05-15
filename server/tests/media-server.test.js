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
  Media
} = require('./../models/media');

const {
  populateMedias,
  medias,
  populateUsers,
  users
} = require('./seed');

beforeEach(populateUsers);
beforeEach(populateMedias);

describe('GET /medias', () => {
  it('should get all medias for admin user', (done) => {
    request(app)
      .get('/medias')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(2);
      })
      .end(done);
  });

  it('should get only user\'s medias for non-admin user', (done) => {
    request(app)
      .get('/medias')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(1);
      })
      .end(done);
  });
});


describe('GET /medias/:id', () => {
  it('should get media for id', (done) => {
    let id = medias[0]._id.toHexString();
    request(app)
      .get('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.users[0]).toBe(users[0].name);
        expect(res.body.media.users[1]).toBe(users[1].name);
      })
      .end(done);
  });

  it('should return 404 if media not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .get('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("media not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .get('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Media ID is invalid");
      })
      .end(done);
  });
});

describe('POST /media', () => {
  it('should create a new media', (done) => {

    let media = {
      location: "/media/media2.mpeg",
      isUrl: false,
      mediaType: "Movie",
      mediaSubtype: "mpeg4",
      description: "Movie 2",
      addedDate: 5646556,
      mediaDate: 14565623,
      tags: ["tag5", "tag6"],
      users: [users[1].name]
    };

    request(app)
      .post('/media')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(media)
      .expect(200)
      .expect((res) => {
        expect(res.body.location).toBe(media.location);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.find({
          location: media.location
        }).then((medias) => {
          expect(medias.length).toBe(1);
          expect(medias[0].location).toBe(media.location);
          expect(new ObjectID(medias[0].users[0])).toEqual(users[1]._id);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create media with invalid body data', (done) => {
    request(app)
      .post('/media')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.find().then((medias) => {
          expect(medias.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});


describe('DELETE /medias', () => {
  it('should delete all medias if admin user', (done) => {
    request(app)
      .delete('/medias')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.n).toBe(2);
      })
      .end(done);
  });

  it('should delete only user\'s medias if not admin user', (done) => {
    request(app)
      .delete('/medias')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.n).toBe(1);
      })
      .end(done);
  });
});

describe('DELETE /medias/:id', () => {
  it('should delete media for id', (done) => {
    let id = medias[0]._id.toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.location).toBe(medias[0].location);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should delete media for id for admin user', (done) => {
    let id = medias[1]._id.toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.location).toBe(medias[1].location);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should not delete media for id for non-admin user', (done) => {
    let id = medias[0]._id.toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media).toExist();
          done();
        }).catch((e) => done(e));

      });
  });



  it('should return 404 if media not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("media not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Media ID is invalid");
      })
      .end(done);
  });


});

describe('UPDATE /medias/:id', () => {


  it('should update media for id', (done) => {
    let media = medias[0];
    let oldLocation = medias[0].location;
    let newLocation = medias[0].location + ' UPDATED';
    media.location = newLocation;
    let id = medias[0]._id.toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(media)
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.location).toBe(newLocation);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media.location).toBe(newLocation);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should not update media for id not owned and not admin', (done) => {
    let media = medias[0];
    let oldLocation = medias[0].location;
    let newLocation = medias[0].location + ' UPDATED';
    media.location = newLocation;
    let id = medias[0]._id.toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .send(media)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Media.findById(id).then((media) => {
          expect(media.location).toBe(oldLocation);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should  update media for id not owned but admin', (done) => {
    let media = medias[1];
    let oldLocation = medias[1].location;
    let newLocation = medias[1].location + ' UPDATED';
    media.location = newLocation;
    let id = medias[1]._id.toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(media)
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.location).toBe(newLocation);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media.location).toBe(newLocation);
          done();
        }).catch((e) => done(e));

      });
  });



  it('should return 404 if media not found', (done) => {
    let media = medias[0];
    let oldLocation = medias[0].location;
    let newLocation = medias[0].location + ' UPDATED';
    media.location = newLocation;
    let id = new ObjectID().toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(media)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("media not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let media = medias[0];
    let oldLocation = medias[0].location;
    let newLocation = medias[0].location + ' UPDATED';
    media.location = newLocation;
    let id = 'x';
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(media)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Media ID is invalid");
      })
      .end(done);
  });
});