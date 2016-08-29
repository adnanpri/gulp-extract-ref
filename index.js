var through = require('through2');
var fs = require('fs');

// Resources
var resources = {};

// start build pattern: <!-- build:[target] output -->
// $1 is the type, $2 is the alternate search path, $3 is the destination file name $4 extra attributes
resources.regbuild = /(?:<!--|\/\/-)\s*build:(\w+)(?:\(([^\)]+)\))?\s*([^\s]+(?=-->)|[^\s]+)?\s*(?:(.*))?\s*-->/;

// end build pattern -- <!-- endbuild -->
resources.regend = /(?:<!--|\/\/-)\s*endbuild\s*-->/;

// IE conditional comment pattern: $1 is the start tag and $2 is the end tag
resources.regcc = /(<!--\[if\s.*?\]>)[\s\S]*?(<!\[endif\]-->)/i;

// Character used to create key for the `sections` object. This should probably be done more elegantly.
resources.sectionsJoinChar = '\ue000';

// strip all comments from HTML except for conditionals
resources.regComment = /<!--(?!\s*(?:\[if [^\]]+]|<!|>))(?:(?!-->)(.|\n))*-->/g;

var parse = function (block) {
  var parts = block.match(resources.regbuild);

  return {
    type: parts[1],
    alternateSearchPaths: parts[2],
    target: parts[3] && parts[3].trim(),
    attbs: parts[4] && parts[4].trim()
  };
};

// Build Block Manager
var sectionsJoinChar = resources.sectionsJoinChar,
  regend = resources.regend,
  sectionKey;

var buildBlockManager = {
  block: false,

  sections: {},

  sectionIndex: 0,

  last: null,

  removeBlockIndex: 0,

  getSectionKey: function (build) {
    var key;

    if (build.attbs) {
      key = [ build.type, build.target, build.attbs ].join(sectionsJoinChar);
    } else if (build.target) {
      key = [ build.type, build.target ].join(sectionsJoinChar);
    } else {
      key = build.type;
    }

    return key;
  },

  setSections: function (build) {
    if (build.type === 'remove') {
      build.target = String(this.removeBlockIndex++);
    }

    sectionKey = this.getSectionKey(build);

    if (this.sections[sectionKey]) {
      sectionKey += this.sectionIndex++;
    }

    this.sections[sectionKey] = this.last = [];
  },

  endbuild: function (line) {
    return regend.test(line);
  }
};

function removeComments(lines) {
  return lines.join('\n').replace(resources.regComment, '').split('\n');
}

// Ref Transformer
var blockTransformer = function (blocks, options) {
  var replaced = {};

  // handle blocks
  Object.keys(blocks).forEach(function (key) {
    var lines = removeComments(blocks[key]);

    // parse out the list of assets to handle, and update the grunt config accordingly
    var assets = lines.map(function (tag) {
      // Allow white space and comment in build blocks by checking if this line has an asset or not
      // The asset is the string of the referenced source file
      return (tag.match(/(href|src)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/) || [])[2];
    }).reduce(function (a, b) {
      return b ? a.concat(b) : a;
    }, []);

    replaced[key] = assets;
  });

  return replaced;
};

module.exports = function(opts) {
  var options = opts || {};
  return through.obj(function(file, encoding, callback) {
    var basePath = file.base;

    if (options.type && options.storage && options.storage[options.type]) {
      this.push(options.storage[options.type]);
    }

    var fileContentString = file.contents.toString();
    var lines = fileContentString.replace(/\r\n/g, '\n').split(/\n/);

    bbm = Object.create(buildBlockManager);
    bbm.sections = {};

    lines.forEach(function (l) {
      if (resources.regbuild.test(l)) {
        bbm.block = true;

        bbm.setSections(parse(l));
      }

      if (bbm.block && bbm.last) {
        bbm.last.push(l);
      }

      // switch back block flag when endbuild
      if (bbm.block && bbm.endbuild(l)) {
        bbm.block = false;
      }
    });

    var blocks = bbm.sections;
    var assets = blockTransformer(blocks, options);

    if (options.storage) {
      options.storage = assets;
    }

    var fileNames = [];
    if (options.type) {
      // this.push(options.storage[options.type]);
      fileNames = options.storage[options.type];
    } else {
      // this.push(options.storage);
      fileNames = options.storage;
    }

    fileNames.forEach(function (fileName) {
        var newFile = file.clone();
        newFile.path = basePath + fileName;
        console.log(newFile.path);
        newFile.contents = fs.readFileSync(newFile.path);
        this.push(newFile);
    }, this);

    callback();
  });
};
