'use strict';

const { json } = require("body-parser");
const { send } = require("process");

module.exports = function (app) {

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxxxxxxxxxxxxxxxxxx";
    uuid = uuid.replace(/x/g, c => {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=="x" ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
 };

  const fs = require("fs");

  app.route('/api/issues/:project')
  
    .get((req, res) => {
      let project = req.params.project;
      const filterIssues = (issues, query) => {
        return issues.filter(issue => {
          for (const key in query) {
            if (query.hasOwnProperty(key) && String(issue[key]) !== query[key]) {
              return false;
            }
          }
          return true;
        });
      }

      let queryFilter = req.query;
      let fileContents;
      let fileExist = fs.existsSync(project + '.json');
      if (fileExist){
        fileContents = JSON.parse(fs.readFileSync(project + '.json'));
        let filteredIssues = filterIssues(fileContents, queryFilter);
        return res.json(filteredIssues);
      } else {
        return res.json({result: 'File does not exist'})
      }
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if (req.body
        && req.body.hasOwnProperty('issue_title') && req.body.issue_title
        && req.body.hasOwnProperty('issue_text') && req.body.issue_text
        && req.body.hasOwnProperty('created_by') && req.body.created_by
      ) {
        const issue = {
          _id:generateUUID(),
          issue_title:req.body.issue_title,
          issue_text:req.body.issue_text,
          created_on: new Date(),
          updated_on:new Date(),
          created_by:req.body.created_by,
          assigned_to:req.body.assigned_to || '',
          open:true,
          status_text:req.body.status_text || ''
        };

        let fileContents;
        let fileExist = fs.existsSync(project + '.json');
        if (fileExist){
          fileContents = JSON.parse(fs.readFileSync(project + '.json'));
          fileContents.push(issue);
        } else {
          fileContents = [issue];
        };

        fs.writeFileSync(project + '.json', JSON.stringify(fileContents));
        return res.json(issue);
  
      } else {
        return res.json({error: 'required field(s) missing'});
      }
       
    })
    
    .put(function (req, res){
      let project = req.params.project;

      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      } else if (req.body
         && !req.body.issue_title
         && !req.body.issue_text
         && !req.body.created_by
         && !req.body.assigned_to
         && !req.body.status_text
      ) {
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      } else {

        let fileContents;
        let fileExist = fs.existsSync(project + '.json');

        if (fileExist){
          fileContents = JSON.parse(fs.readFileSync(project + '.json'));
          let foundIndex = fileContents.findIndex(x => x._id === req.body._id);
          if (foundIndex === -1) {
            return res.json({ error: 'could not update', '_id': req.body._id });
          } else {

          fileContents[foundIndex].issue_title = req.body.issue_title  ? req.body.issue_title : fileContents[foundIndex].issue_title;
          fileContents[foundIndex].issue_text = req.body.issue_text  ? req.body.issue_text : fileContents[foundIndex].issue_text;
          fileContents[foundIndex].updated_on = new Date();
          fileContents[foundIndex].created_by = req.body.created_by  ? req.body.created_by : fileContents[foundIndex].created_by;
          fileContents[foundIndex].assigned_to = req.body.assigned_to  ? req.body.assigned_to : fileContents[foundIndex].assigned_to;
          fileContents[foundIndex].open = req.body.open;
          fileContents[foundIndex].status_text = req.body.status_text ? req.body.status_text : fileContents[foundIndex].status_text;

          fs.writeFileSync(project + '.json', JSON.stringify(fileContents));
          return res.json({  result: 'successfully updated', '_id': req.body._id });}
        } else {
          return res.json({ error: 'could not update', '_id': req.body._id })
        };
      }
    })
    
    .delete(function (req, res){
      let project = req.params.project;

      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      } else {
        let fileExist = fs.existsSync(project + '.json');
        if (fileExist){
          let fileContents = JSON.parse(fs.readFileSync(project + '.json'));
          let deletedContents = fileContents.filter(x => x._id != req.body._id);
          if (fileContents.length === deletedContents.length) {
            return res.json({ error: 'could not delete', '_id': req.body._id });
          };
          fs.writeFileSync(project + '.json', JSON.stringify(deletedContents));
          return res.json({ result: 'successfully deleted', '_id': req.body._id });
        } else {
          return res.json({ error: 'could not delete', '_id': req.body._id });
        };
      };
    });
    
};