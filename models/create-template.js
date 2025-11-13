class Template {
  constructor(name, exercises, coachId, clientId) {
    this.templateId = "t_" + new Date().getTime(); 
    this.name = name;
    this.exercises = exercises || []; 
    this.coachId = coachId;
    this.clientId = clientId || null;
  }
}

module.exports = { Template };
