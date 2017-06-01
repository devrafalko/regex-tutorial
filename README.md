### In This Documentation
1. [Description](#description)
2. [Browser Support](#browser-support)
3. [Keywords](#keywords)
4. [Your regexp samples](#your-regexp-samples)
5. [License](#license)

# Description

##### How does **RegExp Tutorial** work?
RegExp Tutorial contains over 350 useful, vivid and easy-to-understand samples of regular expressions. Regular expression samples cover all regexp special characters [[see below]](#keywords). They are arranged in varying difficulty, starting with simple and ending with complex ones. You can learn all special characters by studying all default samples in the order or you can use search-keyword widget to find all samples matching the particular regexp special character.

##### What can I use **RegExp Tutorial** for?
 * to **learn** regular expressions in JavaScript
 * to **test** your own regular expressions with your own text to match
 * to **create** and **store** your own regular expression samples [[see below]](#your-regexp-samples)
 * to use regular expressions with **`String`** methods `match()` `search()` `split()` and **`RegExp`** methods `test()` `exec()` and find out what they return depending on entered regular expression and text.
 

##### Where can I check how does **RegExp Tutorial** work?
*  Visit https://devrafalko.github.io/regex-tutorial

##### How to use **RegExp Tutorial** tool
* **RegExp Tutorial** tool loads regular expression samples from `samples.json` file
* Each regular expression sample is loaded into separate, numbered container
* Each regular expression container consists of the **regexp box** *(containing regular expression)* and **text box** *(containing text to match)*
* Both **regexp box** and **text box** are editable, so you can change its content to watch in the flow how the regular  expression matches the text
* **Text box** displays editable plain text when is focused, and the rendered text with regexp matches when is blured.
* You can type in the **text box** HTML entities, as eg. `&#36;` `&#93;`, that will be parsed into HTML Symbols. For example, the `&#36;` typed into **text box** *(when focused)* will appear as `$` *(when blured)* and will be matched by the `/\$/` regexp sample.
* When you edit **text box**, you can type `\f` `\n` `\r` `\t` `\v` `\0` or its HTML entities equivalents `&#012;` `&#010;` `&#013;` `&#009;` `&#011;` `&#000;`, that will be parsed into *`form feed`* *`line feed`* *`carriage return`* *`horizontal tab`* *`vertical tab`* *`null char`* HTML Symbols in the blured rendered **text box** content.
* You can get back to the default regular expression and the default text by resetting regex pattern *(button in the footer section of regular expression container)*.
* Each regular expression container consists of the **description box**, **keywords box** and **console box** *(buttons in the footer section of regular expression container)*.
* The default content of **description box** is generated automatically. It is composed correspondingly to the regular expression structure. It describes what each regexp special character used in the regular expression sample is responsible for. You can also add your own descriptions to each regular expression sample [[see below]](#your-regexp-samples).
* The default content of **keywords box** is generated automatically. It contains the keywords corresponding to regexp special characters used in regular expression structure [[see the list of default keywords below]](#keywords). You can also add your own keywords to each regular expression sample [[see below]](#your-regexp-samples).
* You can use **keywords** and **search widget** to **filter** regular expression samples. Click the keywords of your choice in the **keywords box** or in the **description box** or enter keywords *(separated by space)* in the **search widget**. The tool will filter and display all regular expression samples matching all keywords you entered.
* **Console box** displays *(in the flow)* the returned values of **`String`** methods `match()` `search()` `split()` and **`RegExp`** methods `test()` `exec()` according to **regexp box** and **text box** content.
* **Console box** also displays regexp **errors**, when the entered regular expression is incorrect
* Click **RegExp Tutorial Logo** to reset the filtering *(to display all regular expression samples by default)*
* Click the **numerical-order-button** of each regular expression container, to display particular regexp sample and to get the unique-id-url directing to this regexp sample.

# Browser Support

|Chrome|Firefox|Edge|IE|Safari|Opera|iOS Safari|Opera Mini|Global
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|11+|4+|12+|9-11|5.1+|12+|6+|all|95.7%|

# Keywords
The default content of keywords box is generated automatically. It contains the keywords corresponding to regexp special characters used in regular expression structure. Click on the chosen keyword in the **keywords box** or **description box** or enter the keywords *(separated by space)* into **search widget** to filter the regular expression samples.

|keyword|description|sample|
|:---:|:---|:---:|
|`simple-pattern`|Select samples with character combinations that are not any regex special character|`/hello/`|
|`special`|Select samples with reserved special characters `\ ` `/` `*` `+` `{` `}` `(` `)` `[` `]` `^` `$` `?` `.` `|` that must be escaped in order to become non-special characters|`/[a-z]{2,5}?/`|
|`non-special`|Select samples with non-special characters `d` `D` `w` `W` `b` `B` `s` `S` `n` `r` `f` `t` `v` `0` that must be escaped in order to become special characters|`/S\w+/`|
|`flag`|Select samples with at least one of the following flags: `g` `i` `m`|`/abc/g`|
|`g`|Select samples with *global-search-modifier* flag `g`|`/[0-9]/g`|
|`i`|Select samples with *case-insensitive-search-modifier* flag `i`|`/abc/i`|
|`m`|Select samples with *multi-line-search-modifier* flag `m`|`/^\w{5}\d+$/m`|
|`no-flag-g`|Select samples without *global-search-modifier* flag `g`|`/^ID/`|
|`no-flag-i`|Select samples without *case-insensitive-search-modifier* flag `i`|`/^ID/gm`|
|`no-flag-m`|Select samples without *multi-line-search-modifier* flag `m`|`/abc/gi`|
|`.`|Select samples with `.` metacharacter|`/\b.+\b/g`|
|`\w`|Select samples with `\w` metacharacter that matches word-character|`/\b\w+\b/g`|
|`\W`|Select samples with `\W` metacharacter that matches non-word-character|`/\b\w+\W\w+\b/`|
|`\d`|Select samples with `\d` metacharacter that matches digit character|`/[a-z]{3}_\d/`|
|`\D`|Select samples with `\D` metacharacter that matches non-digit character|`/\d\D+?\d/g`|
|`\s`|Select samples with `\s` metacharacter that matches a white space character|`/\s{2,}/g`|
|`\S`|Select samples with `\S` metacharacter that matches a non-white space character|`/\b\S+/g`|
|`\n`|Select samples with `\n` metacharacter that matches a new line character|`/[?!](?=\n)/gm`|
|`n$`|Select samples with `$` quantifier at the end of regular expression|`/.+[.?!;]$/gm`|
|`^n`|Select samples with `^` quantifier at the beginning of regular expression|`/^[A-Z][a-z]+/`|
|`n+`|Select samples with `+` quantifier|`/\w.+\d{2}/`|
|`n*`|Select samples with `*` quantifier|`/10*/g`|
|`n?`|Select samples with `?` quantifier|`/hello\s?/gi`|
|`n{x,}`|Select samples with `{x,}` quantifier, that matches at least number of sequential repetitions|`/\b\w{5,}\b/g`|
|`n{x,y}`|Select samples with `{x,y}` quantifier, that matches at least and at most number of sequential repetitions|`/id_\d{2,8}/`|
|`n{x}`|Select samples with `{x}` quantifier, that matches particular number of sequential repetitions|`/_\d{5}\d.jpg/`|
|`non-greedy`|Select samples with non-greedy-matching quantifier `?`|`/\w{2,5}?/`|
|`[xyz]`|Select samples with square brackets that contains any characters|`/[AD45$_-]{5}/`|
|`[a-z]`|Select samples with square brackets that contains lower case characters range|`/[a-d]{3,}/`|
|`[A-Z]`|Select samples with square brackets that contains upper case characters range|`/[F-J]\w+\b/`|
|`[A-z]`|Select samples with square brackets that contains upper and lower case characters range|`/[F-l]{2}/g`|
|`[0-9]`|Select samples with square brackets that contains digits range|`/[0-3][0-9]/`|
|`[^xyz]`|Select samples with square brackets that does not contain particular characters|`/[^#$%]{5}/`|
|`[^a-z]`|Select samples with square brackets that does not contain lower case characters range|`/[^a-fq-z]+/`|
|`[^A-Z]`|Select samples with square brackets that does not contain upper case characters range|`/^[^A-G]/gm`|
|`[^A-z]`|Select samples with square brackets that does not contain upper and lower case characters range|`/\b[X-c]\b/g`|
|`[^0-9]`|Select samples with square brackets that does not contain digits range|`/^.+[^5-9]$/`|
|`x(?=y)`|Select samples with `(?=)` quantifier|`/\w+?(?=\s)/`|
|`x(?!y)`|Select samples with `(?!)` quantifier|`/\w+(?!\s)/`|
|`(n)`|Select samples with capturing group|`/\w+(er){2}/`|
|`\x`|Select samples with capturing-group-reference metacharacter|`/(ab)(cd)\1\2/`|
|`(?:n)`|Select samples with non-capturing group|`/(ID)(?:1) \1(?:2)/`|
|`x|y`|Select samples with logical operator **OR** `|`|`/chea(p)|(t)/`|
|`\xdd`|Select samples with `\xdd` metacharacter that matches character specified by `dd` hexadecimal number code|`/\w+(?=\x21)/`|
|`\ddd`|Select samples with `\ddd` metacharacter that matches character specified by `ddd` octal number code|`/\056{3}/g`|
|`\udddd`|Select samples with `\uddd` metacharacter that matches Unicode character specified by `dddd` hexadecimal number code|`/\d+\u0025/g`|
|`\b`|Select samples with word boundary metacharacter `\b`|`/\b[A-z]+\b/g`|
|`\B`|Select samples with non-word boundary metacharacter `\B`|`/\B([a-z])\1/`|
|`\f`|Select samples with `\f` metacharacter that matches a form feed character|`/.+\f$/gm`|
|`\r`|Select samples with `\r` metacharacter that matches a carriage return character|`/hello\rworld/`|
|`\t`|Select samples with `t` metacharacter that matches a tab character|`/^\t{1,}/gm`|
|`\v`|Select samples with `\v` metacharacter that matches a vertical tab character|`/^\v$/gm`|
|`\0`|Select samples with `\0` metacharacter that matches a NUL character|`/^_id:\s?\0$/m`|
|`modifier`|Select samples where any of the following modifiers has been found: `flag` `g` `no-flag-g` `i` `no-flag-i` `m` `no-flag-m`|`/[F-l]{2}/`|
|`bracket`|Select samples where any of the following brackets has been found: `?:n` `x|y` `xyz` `[a-z]` `[A-Z]` `[A-z]` `[0-9]` `[^xyz]` `[^a-z]` `[^A-Z]` `[^A-z]` `[^0-9]`|`/^[^A-G]/gm`|
|`metacharacter`|Select samples where any of the following metacharacters has been found: `\b` `\B` `\d` `\D` `\f` `\r` `\t` `\v` `\n` `\s` `\S` `\w` `\W` `non-special` `\dddd` `\xdd` `.`|`/\d\D+?\d/g`|
|`quantifier`|Select samples where any of the following quantifiers has been found: `^n` `n$` `n*` `n?` `n+` `x(?=y)` `x(?!y)` `n{x}` `n{x,y}` `n{x,}` `non-greedy` `special`|`/10*/g`|

# Your regexp samples
###### In order to add your own regular expression samples:
* fork this repository
* edit `samples.json` file *(edit existing or add new regexp samples)*
* in order to **add new** regexp samples, use the syntax below or use `ajaxHandle.utils.generateId(num,function(a) { console.log(a); });` function to generate *samples.json* regex sample **templates** with unique IDs. The `num` argument must be of type `Number` and it indicates the number of empty templates to generate.

```javascript
[
	{
		"regex": "/hello world/g",
		"content": "this is the text used to match the regular expression above",
		"description": [
		    "this is the {code{sample}} of code style",
			"this is the {mark{sample}} of marked text style",
			"this is the {val{sample}} of value style",
			"this is the {reg{/sample/}} of text parsed to regexp code",
			"this is the {search{sample}} of text parsed to keyword",
			"this is the {link{http://github.com{sample}}} of text parsed to hyperlink"],
		"keywords": ["extra","keywords","to","filter","this","regexp","sample","in","search","widget"],
		"id": "uniqueID1"
	},	
	{
		"regex": "/\\w+/gim",
		"content": "this is the text used to match the regular expression above",
		"description": [
		    "the first user description",{
		    "the header of the second user description list":[
		        "the first item",
				"the second item"]},
			"the third user description",
		"keywords": ["another","extra","keywords"],
		"id": "uniqueID2"
	}
]
```

###### `"regex"` property:
* the value of *"regex" property* will appear in the **regexp box**
* in order to insert **backslash** `\` into the regular expression *(or any regexp character consists of **backslash**, as `\x38` `\w` `\n` `\S`)* escape it with double backslash `\\x38` `\\w` `\\n` `\\S`, eg. `/\\w{5,15}\\d{3}/g`
* the `\f` `\n` `\r` `\t` entered in *"regex" propertie's* value will appear as `\f` `\n` `\r` `\t` in **regexp box**
* the HTML entities, as `&#36;` `&#93;`, entered in *"regex" propertie's* value **will not** be parsed into appropriate HTML symbols in **regexp box**. For example, the regexp value `/abc&#36;abc/g` will appear as `/abc&#36;abc/g` in the **regexp box**
* open the browser's console, to check out whether any semantic error was committed in your `samples.json` file. Follow the error messages to create syntactically correct regular expression sample

###### `"content"` property:
* the value of *"content" property* will appear in the **text box**
* HTML reserved characters, as `<` `>` entered in *"content" propertie's* value **will not** be parsed into **HTML tags**. They will appear as plain text in the **text box**
* the HTML entities, as `&#36;` `&#93;`, entered in "content" propertie's value **will be** parsed into appropriate HTML symbols `$` `]` in **regexp box**
* in order to insert **form feed** `\f` character into **text box**, enter **`"\f"`** or **`"&#012;"`** into *"content" property* value. In order to insert **`"\f"`** as a plain text into **text box**, enter **`"\\f"`** into *"content" property* value
* in order to insert **line feed** `\n` character into **text box**, enter **`"\n"`** or **`"&#010;"`** into *"content" property* value. In order to insert **`"\n"`** as a plain text into **text box**, enter **`"\\n"`** into *"content" property* value
* in order to insert **carriage return** `\r` character into **text box**, enter **`"\r"`** or **`"&#013;"`** into *"content" property* value. In order to insert **`"\r"`** as a plain text into **text box**, enter **`"\\r"`** into *"content" property* value
* in order to insert **horizontal tab** `\t` character into **text box**, enter **`"\t"`** or **`"&#009;"`** into *"content" property* value. In order to insert **`"\t"`** as a plain text into **text box**, enter **`"\\t"`** into *"content" property* value
* in order to insert **vertical tab** `\v` character into **text box**, enter **`"&#011;"`** into *"content" property* value. In order to insert **`"\v"`** as a plain text into **text box**, enter **`"\\v"`** into *"content" property* value
* in order to insert **null** `\0` character into **text box**, enter **`"&#000;"`** into *"content" property* value. In order to insert **`"\0"`** as a plain text into **text box**, enter **`"\\0"`** into *"content" property* value

###### `"description"` property:
* use *"description" property* to add **extra descriptions** to each regexp sample. They will appear at the top of the **description box**
* the default descriptions will be generated automatically anyway
* in order to create user descriptions, add new `String` items into *"description" propertie's* array `["description A","description B"]`
* in order to create a **list-like-description**, add `Object` as array item with property **name** *(description header)* and `Array` property **value** *(individual list items)* `{"description header": ["list item A","list item B"]}`
* you can omit *"description" property* as empty array, then only default description will be added
* you can use **special tags** to style or add extra functionality to the part of description content
* embrace text with `{code{some text}}` to convert `"some text"` into **computer code**
* embrace text with `{mark{some text}}` to convert `"some text"` into **marked text**
* embrace text with `{val{some text}}` to convert `"some text"` into **value text**
* embrace text with `{reg{some text}}` to convert `"some text"` into clickable **regexp sample** *(click to insert **regex sample** into **regexp box**)*
* embrace text with `{search{some text}}` to convert `"some text"` into clickable **keyword** *(click to insert **keyword** into **search widget**)*
* embrace text with `{link{http://www.someurl.com{some text}}}` to convert `"some text"` into clickable **hyperlink** *(click to link to the entered url)*

###### `"keywords"` property:
* use *"keywords" property* to add **extra keywords** to each regexp sample. They will appear in the **keywords box**
* **extra keywords** allows the user to search regexp samples by these keywords in the **search widget**
* the default keywords will be generated automatically anyway
* to create user keywords, add new `String` items into *"keywords" propertie's* array `["keyword_A","keyword_B"]`
* you can omit *"keywords" property* as empty array, then only default keywords will be added

###### `"id"` property:
* each regexp sample should have its unique ID value defined
* open the browser’s console, to check out whether any of IDs was doubled.
* ID allows the user to filter regexp samples by ID *(enter the ID preceded with # into url address to display the regexp sample of the entered ID)*
* use `ajaxHandle.utils.generateId(num,function(a) { console.log(a); });` function to generate *samples.json* regex sample templates with unique IDs. The `num` argument must be of type `Number` and it indicates the number of templates to generate.

# License
>Copyright (c) 2017 Paweł Rafałko dev.rafalko@gmail.com

>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge or publish copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

>The above copyright notice and this permission notice **shall be included** in all
copies or substantial portions of the Software.

> This software **may not be** resold, redistributed, sell or otherwise conveyed to a third party.

>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
