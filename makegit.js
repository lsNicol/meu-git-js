;(function(){
  function Git(name){
    this.name = name;
    this.lastCommitId = -1;
    this.branches = [];

    var main = new Branch("main", null);
    this.branches.push(main);

    this.HEAD = main;
  }
  function Commit(id, parent, message){
    this.id = id;
    this.parent = parent;
    this.message = message;
  }
  function Branch(name, commit){
    this.name = name;
    this.commit = commit;
  }

  Git.prototype.commit = function(message){
    const commit = new Commit(++this.lastCommitId, this.HEAD.commit, message);
    this.HEAD.commit = commit;
    return commit;
  };

  Git.prototype.log = function(){
    console.log("--- REPOSITORY COMMIT LOG ---");
    let commit = this.HEAD.commit,
      history = [];
    if (commit === null) {
      console.log("  No commits yet.");
      return;
    }
    while (commit != null){
      history.push(`commit: ${commit.id}: "${commit.message}"`);
      console.log(`%ccommit ${commit.id}`, "color: #e65100; font-weight: bold;");
      console.log(`Author: Developer <you@linux.com>`);
      console.log(`    ${commit.message}\n`);
      commit = commit.parent;
    }
  };

  window.Git = Git;
})();
