(function($) {
    $.fn.eqInput = function() {
        var defaultOps = {},
            options = $.extend(true, defaultOps, (typeof arguments[0] === 'object' ? [].shift.apply(arguments) : {})),
            target = this[0],
            input = this,
            openBrackets = ['(', '[', '{'],
            closeBrackets = [')', ']', '}'];
    
        //modified/stripped version of jquery caret: http://code.accursoft.com/caret/overview
        var caret = function(pos) {
            var sel = window.getSelection();
            if(pos !== undefined) {
                target.focus();
                var range = document.createRange();
                //find the appropriate node to collapse
                var index = 0; //start at the beginning
                while(true) {
                    var node = target.childNodes[index];
                    if(!node) return;  
                    var l = node.textContent.length; 
                    if(l < pos) {
                        index++;
                        pos -= l;
                    }
                    else break;
                }
                range.setStart(target.childNodes[index], pos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range); 
            }
            else {
                target.focus();
                var range1 = sel.getRangeAt(0),
                    range2 = range1.cloneRange();
                range2.selectNodeContents(target);
                range2.setEnd(range1.endContainer, range1.endOffset);
                return range2.toString().length;
            }
        },
        
        markedBracket = function(bracket) {
            return '<span class="marked-bracket">'+bracket+'</span>';
        },
                
        replaceText = function(str, text, start, end) {
            end = end || start+1;
            return str.substring(0, start) + text + str.substring(end, str.length);
        },
                
        getNearestBracket = function(str, pos) {
            var retval = {}, found = false;
                findAt = function(loc) {
                    var ch = str.charAt(loc),
                        index = openBrackets.indexOf(ch),
                        isOpenBracket = index !== -1;
                    if(isOpenBracket || closeBrackets.indexOf(ch) !== -1) {
                        retval = {
                            position: loc,
                            isOpenBracket: isOpenBracket,
                            bracket: ch,
                            index: index
                        };
                        found = true;
                    }
                };
            found = findAt(pos-1);
            if(!found) findAt(pos);

            return retval;
        },
        
        findMatchingIndex = function(forBracket, str) {
            var opened = 0,
                reversed = !forBracket.isOpenBracket, start, end;

            if(reversed) { start = 0; end = forBracket.position+1; }
            else { start = forBracket.position; end = str.length; }

            for(var i=start; i<end; i++) {
                var index = reversed ? forBracket.position-i : i;
                var ch =  str.charAt(index),
                    cbi = closeBrackets.indexOf(ch),
                    obi = openBrackets.indexOf(ch);

                if(obi !== -1) opened++;
                if(cbi !== -1) opened --;

                if(opened === 0 && (obi === forBracket.index || cbi === forBracket.index)) {
                    //if no close bracket is found meaning we have an open bracket and  the brackets come 
                    //from the same row
                    if(cbi === -1 && obi === closeBrackets.indexOf(forBracket.bracket) || 
                            cbi !== -1 && cbi === openBrackets.indexOf(forBracket.bracket)) {
                        return (reversed ? forBracket.position-i: i);
                    }
                }
            }
            return null;
        },
                
        getTextSelection = function() {
            var selected = '';
            if (typeof window.getSelection !== "undefined") {
                 var sel = window.getSelection();
                 if (sel.rangeCount) {
                     var container = document.createElement("div");
                     for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                         container.appendChild(sel.getRangeAt(i).cloneContents());
                     }
                     selected = container.innerHTML;
                 }
             } else if (typeof document.selection !== "undefined") {
                 if (document.selection.type === "Text") {
                     selected = document.selection.createRange().htmlText;
                 }
             }
             return selected;
        },
                
        highlight = function() {
            var pos = caret(),
                text = input.text(),
                nearest = getNearestBracket(text, pos),
                selected = getTextSelection(),
                first, second; 

            if(nearest.bracket) {
                var matching = findMatchingIndex(nearest, text);
                if(matching !== null) {
                    if(nearest.isOpenBracket) { first = nearest.position; second = matching; }
                    else { first = matching; second = nearest.position; }

                    var markedOpen = markedBracket(text.charAt(first)),
                        markedClose = markedBracket(text.charAt(second)),
                        formatted = text = replaceText(text, markedOpen, first);
                    //adjust the index by adding the html length and replace the other bracket 
                    formatted = replaceText(formatted, markedClose, second + (markedOpen.length-1));
                    text = formatted;
                }
            }
            if(!selected) {
                input.html(text);
                caret(pos);
            }
        };

        input.keypress(function(e) {
            var c = String.fromCharCode(e.which),
                obi = openBrackets.indexOf(c),
                cbi = closeBrackets.indexOf(c),
                text = input.text(),
                pos = caret(),
                obracket = openBrackets[obi], //search the brackets
                cbracket = closeBrackets[obi], //search the brackets
                selectedText = getTextSelection(); //get whatever text is selected

            if(obi !== -1) {
                e.preventDefault();
                var beforeCaret = text.substring(0, pos),
                    remainder = text.substring(pos, text.length),
                    bracketed; 

                if(selectedText) {
                    bracketed = text.substring(0, pos-selectedText.length) + obracket + selectedText + cbracket + text.substring(pos, text.length);
                }
                else {
                    bracketed = beforeCaret + obracket + cbracket + remainder;
                }

                input.html(bracketed);            
                caret(pos+1);
            }

            if(cbi !== -1) {
                var nextChar = text.charAt(pos); //if the next character is a bracket
                if(closeBrackets.indexOf(nextChar) !== -1 && nextChar === c) {
                    e.preventDefault();//stop the bracket from being inserted
                    caret(pos+1); //just move forward
                } 
            }
        });
        
        input.mouseup(function(e) {
            highlight();
        });

        input.keyup(function(e) {
            highlight();
        });
    };
})(jQuery);
