;(function(){
  function Git(name){
    this.name = name;
    this.lastCommitId = -1;
  }
  function Commit(id, message){
    this.id = id;
    this.message = message;
  }

  Git.prototype.commit = function(message){
    const commit = new Commit(++this.lastCommitId, message);
    return commit;
  };

  window.Git = Git;
})();
