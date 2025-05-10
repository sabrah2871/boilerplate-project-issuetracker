const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);
  test('#1 Test POST /api/issues/apitest with all fields', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Joe",
        assigned_to: "Joe",
        status_text: "In checking"
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'Joe');
        assert.equal(res.body.assigned_to, 'Joe');
        assert.equal(res.body.status_text, 'In checking');
        assert.equal(res.body.open, true);
        done();
      });
  });
  test('#2 Test POST /api/issues/apitest with required fields', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Joe"
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'Joe');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.equal(res.body.open, true);
        done();
      });
  });
  test('#3 Test POST /api/issues/apitest without required fields', function (done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({
        assigned_to: "Joe",
        status_text: "In checking"
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });  
  test('#4 Test GET /api/issues/apitest', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isArray(res.body);
        done();
      });
  });  
  test('#5 Test GET /api/issues/apitest with one filter', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest/?open=false')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isArray(res.body);
        const satisfyFilter = (arr,prop,cond) => arr.prop === cond;
        assert.equal(res.body.every(satisfyFilter,'open',false),true);
        done();
      });
  });  
  test('#6 Test GET /api/issues/apitest with multiple filter', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest/?open=false&assigned_to=Joe&issue_title=Title')
      .send({
        open: true,
        assigned_to: 'Joe',
        issue_title: 'Title'
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isArray(res.body);
        const satisfyFilter = (arr,prop,cond) => arr.prop === cond;
        assert.equal(res.body.every(satisfyFilter,'open',true),true);
        assert.equal(res.body.every(satisfyFilter,'assigned_to','Joe'),true);
        assert.equal(res.body.every(satisfyFilter,'issue_title','Title'),true);
        done();
      });
  });  
  test('#7 Test PUT /api/issues/apitest update one field', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({
        _id: '3b1e00849e8f2203956985f9',
        assigned_to: 'Joe',
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, {  result: 'successfully updated', _id: '3b1e00849e8f2203956985f9' });
        done();
      });
  });  
  test('#8 Test PUT /api/issues/apitest update multiple field', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({
        _id: '3b1e00849e8f2203956985f9',
        assigned_to: 'Joe',
        issue_title: 'Title',
        issue_text: 'Text'
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, {  result: 'successfully updated', _id: '3b1e00849e8f2203956985f9' });
        done();
      });
  });  
  test('#9 Test PUT /api/issues/apitest missing id', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({
        assigned_to: 'Joe',
        issue_title: 'Title',
        issue_text: 'Text'
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });  
  test('#10 Test PUT /api/issues/apitest update no field', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({_id: 'f09ed59648bd3ebfa6f247a3'})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: 'f09ed59648bd3ebfa6f247a3' });
        done();
      });
  });  
  test('#11 Test PUT /api/issues/apitest update invalid id', function (done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({
        _id: '12345678901234567890',
        assigned_to: 'Joe',
        issue_title: 'Title',
        issue_text: 'Text'
        })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { error: 'could not update', _id: '12345678901234567890' });
        done();
      });
  });  
  test('#12 Test DELETE /api/issues/apitest delete an issue', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({_id: '17b288dd9b5a8b5f7a46b98a'})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { result: 'successfully deleted', _id: '17b288dd9b5a8b5f7a46b98a' });
        done();
      });
  });  
  test('#13 Test DELETE /api/issues/apitest delete invalid id', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({_id: '12345678901234567890'})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { error: 'could not delete', _id: '12345678901234567890' });
        done();
      });
  });  
  test('#14 Test DELETE /api/issues/apitest delete missing id', function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send()
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });  

});
