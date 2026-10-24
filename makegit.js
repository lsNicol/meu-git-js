;(function(){
  function Git(name){
    this.name = name;
    this.lastCommitId = -1;
    this.HEAD = null;
  }
  function Commit(id, parent, message){
    this.id = id;
    this.parent = parent;
    this.message = message;
  }

  Git.prototype.commit = function(message){
    const commit = new Commit(++this.lastCommitId, this.HEAD, message);
    this.HEAD = commit;
    return commit;
  };
  Git.prototype.log = function(){
    console.log("--- REPOSITORY COMMIT LOG ---");
    let commit = this.HEAD,
      history = [];
    if (commit === null) {
      console.log("  No commits yet.");
      return;
    }    
    while (commit != null){
      history.push(`commit: ${commit.id}: "${commit.message}"`);
      console.log(`%ccommit ${commit.id}`, "color: #e65100; font-weight: bold;");
      console.log(`Author: Developer <you@linux.com>`);
      console.log(`\n    ${commit.message}\n`);
      commit = commit.parent;
    }
  };

  window.Git = Git;
})();
