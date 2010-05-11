tinylog is an extensible, yet minimalistic, logging platform.


Getting Started
---------------

For the following examples, it is assumed that you upload tinylog to a folder also named
tinylog which is relative to the path you are going to use tinylog on.

1. [Download tinylog][1].
2. Include the following code in the page you want to use tinylog on:
   <p><pre><code>&lt;link rel="stylesheet" type="text/css" href="tinylog/themes/default.tinylog.css" title="tinylog" /&gt;</code></pre></p>
3. Also include this following code in the page too:
   <p><pre><code>&lt;script type="text/javascript" src="tinylog/tinylog.min.js"&gt;&lt;/script&gt;</code></pre></p>
4. Optionally include any encoder or decoder scripts if needed.
5. Read the API documentation below.


Supported Browsers
------------------

The only officially supported browsers at the moment are as follows. More browsers will
be officially supported eventually.

* Google Chrome 4+
* Firefox 3.5+
* Opera 10+

Only browsers that support the [W3C File API][2] can use the tinylog viewer app.


tinylog lite
------------

tinylog lite is a bare-bones implementation of tinylog intended primarily for embedding
into other libraries. The only API method supported is
<code>tinylog.<strong title="void">log</strong>()</code>. Theming, configuration, saving
logs, etc. are not supported in tinylog lite.


Demos
-----

There are live demos you can try out at [code.eligrey.com/tinylog][3].


API
---

Strong and emphasized text has titles (which can be viewed by hovering your cursor over
them) containing their type if they are not functions or return type if they are.
Functions are denoted with a suffix of `()`.


### Methods

<dl>
  <dt><code>tinylog.<strong title="void">log</strong>([<em title="String">message-1</em>], [...], [<em title="String">message-N</em>])</code></dt>
  <dd>
    Forwards the messages (concatenated together and separated with spaces) to
    <code>tinylog.<strong title="void">postEntry</strong>()</code>.
  </dd>
  
  <dt>
    <code>tinylog.<strong title="void">postEntry</strong>(<em title="Date">date</em>,
    <em title="String">message</em>)</code>
  </dt>
  <dd>
    Adds <code><em title="String">message</em></code> to the log and with metadata from
    <code><em title="Date">date</em></code>. You can easily define your own
    <code>tinylog.<strong title="void">postEntry</strong>()</code> method to integrate
    tinylog into any platform.
  </dd>
  
  <dt><code>tinylog.<strong title="String">encode</strong>([<em title="Array">encodings</em>], [<em title="Array">log</em>])</code></dt>
  <dd>
    Returns <code><em title="Array">log</em></code> (defaults to
    <code>tinylog.<strong title="Array">entries</strong></code>) encoded using the
    encoding specified by <code>tinylog.<strong title="String">encoding</strong></code>.
  </dd>
  
	  <dt><code>tinylog.<strong title="unambiguous">decode</strong>(<em title="unambiguous">data</em>)</code></dt>
  <dd>
    Returns the decoded tinylog array from <code><em title="String">data</em></code>.
  </dd>
  
  <dt><code>tinylog.<strong title="void">clear</strong>()</code></dt>
  <dd>Clears the log of all output if possible.</dd>
  
  <dt><code>tinylog.<strong title="void">uninit</strong>()</code></dt>
  <dd>Removes all traces of tinylog from the DOM, including any event listeners.</dd>
  
  <dt><code>tinylog.<strong title="void">display</strong>()</code></dt>
  <dd>Displays the log.</dd>

  <dt><code>tinylog.<strong title="void">setEncodings</strong>(<em title="String">encoding-1</em>, [...], [<em title="String">encoding-N</em>])</code></dt>
  <dd>
    Sets the encodings to use when encoding a log. The encodings are applied in order.
    This is useful for specifying a format encoding and a compression encoding (such as
    JSON and DEFLATE).
  </dd>
  
  <dt><code>tinylog.<strong title="void">setSafetyMargin</strong>(<em title="Boolean">safetyMarginPreference</em>)</code></dt>
  <dd>
    If the preference is set to true, a margin is set at the bottom of the parent node
    that can accomidate the full height of the log.
  </dd>
</dl>

### Fields

<dl>
  <dt><code>tinylog.<strong title="Array">entries</strong></code></dt>
  <dd>
    An array of the currently displayed log. It is in the format of
    <code>[[<em title="Date">date-1</em>, <em title="String">message-1</em>],
    [<em title="Date">date-2</em>, <em title="String">message-2</em>], ...]</code>.
  </dd>
</dl>


### Configuration

<dl>
  <dt><code>console.<strong title="Boolean">TINYLOG</strong></code></dt>
  <dd>
    An option that when <code>true</code>, native consoles are not used when available.
    Otherwise, native consoles will be used if available.
  </dd>
</dl>


### Using Encoders &amp; Decoders

To use an encoding format, call
<code>tinylog.<strong title="void">setEncodings</strong>()</code>, passing it all of the
encodings to be used, in order.

Creating your own encoders and decoders is easy! An encoder must return an octet string
of the encoded data. The following example implements the built-in JSON encoder and
decoders.

    tinylog.encoders.JSON = function (log) {
        return unescape(encodeURIComponent(JSON.stringify(log)));
    };
    
    tinylog.decoders.JSON = function (data) {
        return JSON.parse(decodeURIComponent(escape(data)));
    };

`unescape(encodeURIComponent(string))` is a neat trick to encode a UTF-8 string as an
octet string. `decodeURIComponent(escape(string))` does the opposite, decoding an octet
string into UTF-8.

### The `application/x-tinylog` Format

The `application/x-tinylog` format consists of the following parts, in this order:

* Optional `GIF89a\1\0\1\0\x91\xFF\0\xFF\xFF\xFF\0\0\0\xC0\xC0\xC0\0\0\0!\xF9\x04\1\0\0\2\0,\0\0\0\0\1\0\1\0\0\2\2T\1\0;`
* Format name
* A line-break
* Log payload

For example, a JSON-encoded log could look like:

    JSON
    [[1271631583277, "First message"], [1271631585534, "Second message"]]

Formats can encode other formats and be recursively decoded by having the decoder call
<code>tinylog.<strong title="unambiguous">decode</strong>()</code>.


Theming tinylog
---------------

It is very easy to create custom themes using tinylog. Take a look at the
[default theme][4] to see what classes there are to style.


![Tracking image](//in.getclicky.com/212712ns.gif =1x1)


 [1]: http://github.com/eligrey/tinylog/zipball/master
 [2]: http://www.w3.org/TR/FileAPI/
 [3]: http://code.eligrey.com/tinylog/
 [4]: http://github.com/eligrey/tinylog/blob/master/themes/default.tinylog.css
