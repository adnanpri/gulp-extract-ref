## Information

<table>
<tr>
<td>Package</td><td>gulp-extract-ref</td>
</tr>
<tr>
<td>Description</td>
<td>Extract file references from HTML build blocks.</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.10</td>
</tr>
</table>

This plugin heavily uses [useref](https://github.com/jonkemp/useref) components.

## Usage

```js
var extRef = require('gulp-extract-ref');
var concat = require('gulp-concat');

gulp.task('scripts', function() {
  return gulp.src('app/index.html')
    .pipe(extRef({type: 'js'}))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
});
```

This find all the scripts between `<!-- build:js -->` and `<!-- endbuild -->` and pass it to concat to produce `all.js`.

Files will be concatenated in the order that they are found in `app/index.html`.

## Parameters

The `type` parameter can be specify a particular build block. E.g. `{type: 'someType'}` will find files within `<!-- build:someType -->` and `<!-- endbuild -->`.

## LICENSE

(MIT License)

Copyright (c) 2016 Shifat Adnan <adnan.pri@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
