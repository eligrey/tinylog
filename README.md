tinylog is a minimalistic logging platform.


Supported Browsers
------------------

The only officially supported browsers at the moment are Google Chrome 4+, Firefox 3.5+,
and Opera 10+. More browsers will be officially supported eventually.

Only browsers that support the [W3C File API][1] can use the tinylog viewer app.


Demos
-----

There are demos you can try out at [code.eligrey.com/tinylog][2].


API
---

Strong and emphasized text have titles (which can be viewed by hovering your cursor over
them) containing their type if they are not functions or return type if they are.


### Methods

<dl>
  <dt><code>tinylog.<strong title="void">log</strong>([<em title="String">message-1</em>], [<em title="String">message-2</em>], [<em title="String">...</em>])</code></dt>
  <dd>
    Forwards the messages (concatenated together and separated with spaces) to
    <code>tinylog.<strong title="void">postEntry</strong></code>.
  </dd>
  
  <dt>
    <code>tinylog.<strong title="void">postEntry</strong>(<em title="Date">date</em>,
    <em title="String">message</em>)</code>
  </dt>
  <dd>
    Adds <code><em title="String">message</em></code> to the log and with metadata from
    <code><em title="Date">date</em></code>. You can easily define your own
    <code>tinylog.<strong title="void">postEntry</strong></code> method to integrate
    tinylog into any platform.
  </dd>
  
  <dt><code>tinylog.<strong title="String">encode</strong>([<em title="Array">log</em>])</code></dt>
  <dd>
    Returns <code><em title="Array">log</em></code> (defaults to
    <code>tinylog.<strong title="Array">logEntries</strong></code>) encoded using the
    encoding specified by <code>tinylog.<strong title="String">encoding</strong></code>.
  </dd>
  
  <dt><code>tinylog.<strong title="Array">decode</strong>(<em title="String">data</em>)</code></dt>
  <dd>
    Returns the decoded tinylog array from <code><em title="String">data</em></code>.
  </dd>
  
  <dt><code>tinylog.<strong title="void">clear</strong>()</code></dt>
  <dd>Clears the log of all output if possible.</dd>
  
  <dt><code>tinylog.<strong title="void">uninit</strong>()</code></dt>
  <dd>Removes all traces of tinylog from the DOM, including any event listeners.</dd>
</dl>

### Fields

<dl>
  <dt><code>tinylog.<strong title="Array">logEntries</strong></code></dt>
  <dd>
    An array of the currently displayed log. It is in the format of
    <code>[[<em title="Date">date-1</em>, <em title="String">message-1</em>],
    [<em title="Date">date-2</em>, <em title="String">message-2</em>], ...]</code>.
  </dd>
</dl>


### Configuration

<dl>
  <dt><code>tinylog.<strong title="String">encoding</strong></code></dt>
  <dd>
    A string representing the encodings to use when encoding a log separated by plus
    signs. The encodings are applied in order. An example encoding of
    <code>"foo+bar"</code> would first encode the log using the foo encoding, and encode
    the foo-encoded data using bar. This is useful for specifying an encoding and a
    compression encoding (such as <code>"json+deflate"</code>).
  </dd>
  
  <dt><code>tinylog.<strong title="Boolean">USE_NATIVE</strong></code></dt>
  <dd>
    An option that when specified explicitly as <code>false</code>, native consoles are
    not used when available.
  </dd>
  
  <dt><code>tinylog.<strong title="Boolean">AUTO_DISPLAY</strong></code></dt>
  <dd>
    An option that when is <code>true</code>, the tinylog log is automatically displayed
    in the page as soon as possible.
  </dd>
</dl>


### Using Encoders &amp; Decoders

Adding a method with the name of an encoding to
<code>tinylog.<strong title="Object">encoders</strong></code> will make it the encoder
for that encoding. It will be passed an array which contains the data for a tinylog in
the format of <code>tinylog.<strong title="Array">logEntries</strong></code>. Likewise,
adding a method with the name of an encoding to
<code>tinylog.<strong title="Object">decoders</strong></code> will make it the decoder
for that encoding. Decoders are passed strings which are the data to be decoded.


Theming tinylog
---------------

It is very easy to create custom themes using tinylog. Take a look at the
[default theme][3] to see what classes there are to style.



 [1]: http://www.w3.org/TR/FileAPI/
 [2]: http://code.eligrey.com/tinylog/
 [3]: themes/default.tinylog.css
