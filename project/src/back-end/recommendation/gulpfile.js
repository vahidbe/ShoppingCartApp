const gulp = require('gulp')
const nodemon = require('gulp-nodemon')

gulp.task('start', () => {
  nodemon({
    script: './src/daemon'
  })
})

gulp.task('default', ['start'])
