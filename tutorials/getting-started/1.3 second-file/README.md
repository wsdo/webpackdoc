# Second file

Next, we will move some code into an extra file.

$$$ files

And recompile with:

``` sh
$ webpack ./entry.js bundle.js
```

Update your browser window and you should see the text `It works from content.js.`.

$$$ index.html

> webpack will analyze your entry file for dependencies to other files. These files (called modules) are included in your `bundle.js` too. webpack will give each module a unique id and save all modules accessible by id in the `bundle.js` file. Only the entry module is executed on startup. A small runtime provides the `require` function and executes the dependencies when required.
