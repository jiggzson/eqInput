jquery eqInput
==============

A simple equation input with bracket completion and highlighting. 

Uses jquery. And needs styling.

*Does not work for IE < 9*

_Usage:_
Load jquey.eqInput.js and jquery.eqInput.css

```html
<div id="eq-input"></div>
```
To add a place holder use data-placeholder attribute

```html
<div id="eq-input" data-placeholder="Insert formula"></div>
```

```javascript
$('#eq-input').eqInput();
```

To change the highlight color and styling edit css or supply custom class
```javascript
$('#eq-input').eqInput({highlightClass: 'some-custom-class'})
```

Use text method to get input contents
