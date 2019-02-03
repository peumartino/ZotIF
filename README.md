# ZotIF
plugin to add Impact Factors in Zotero database

<h1>General description</h1>
This plugin read a csv file containing Impact Factors and add them in the extra field of the reference
The csv file must follow the following format:

journal name,journal abbreviated name,impact factor

Here is an example:

<pre>
LANCET,LANCET,53.254<br/>
Nature Reviews Materials,NAT REV MATER,51.941<br/>
NATURE REVIEWS DRUG DISCOVERY,NAT REV DRUG DISCOV,50.167<br/>
Nature Energy,NAT. ENERGY,46.859<br/>
</pre>

* Case is not significant since the extension will convert everything to upper case on file import.
* The extension will also remove all the dots on import

This means that "NAT. ENERGY","NAT ENERGY","Nat energy", etc... are identical

If you want to have more than one abbrevation, you can duplicate line. For instance, "The journal of molecular biology" is sometimes written "journal of molecular biology" and may be abbreviated as "J Biol Chem" or "JBC". In that case you can simply add in your file:
<pre>
The journal of molecular biology, J Biol Chem,4.011<br/>
journal of molecular biology, JBC,4.011<br/>
</pre>

but you could also decide to write it as:
<pre>
The journal of molecular biology, J Biol Chem,4.011<br/>
The journal of molecular biology, JBC,4.011<br/>
journal of molecular biology, J Biol Chem,4.011<br/>
</pre>
In fact ZotIF will take all the journals and abbreviations and will match them with the 'publicationTitle' and 'journalAbbreviation' fields of the selected citations. Any match will be considered. For instance, the 'journalAbbreviation' in your reference can match with a journal or an abbreviation in the csv file. The reverse is also true. The best is to consider that all the journal names and abbreviations declared in your csv file are in fact journal names that can match with any of the two fields "publicationTitle" and "journalAbbreviation" in your database.

In summary, the 3-column format of the csv file is just for convenience and you can decide to write everything as journals, as soon as you respect the 3-column csv format:
<pre>
The journal of molecular biology,,4.011<br/>
J Biol Chem,,4.011<br/>
journal of molecular biology,,4.011<br/>
JBC,,4.011<br/>
</pre>
In that case, ZotIF will discard any empty name (all the abbreviations) and will consider all the journal names in the first column.

A last remark. ZotIF does not make any checking on the values. This means you can use the plugin to enter any value instead on an impact factor. For instance, if you are a book shop, you can have a csv file containing the book prices:
<pre>
  Alice in Wonderland,,4.2$<br/>
  I Married a Communist,,3.75$<br/>
</pre>
By default, the values are matched against the fields 'publicationTitle' and 'journalAbbreviation'. This is not the desired behavior and you should match against the 'title" field. You can do that in ZotIF advanced settings. <em>see below</em>

<h1>Usage</h1>

* Install as usual for Zotero plugins
* Go to menu "Tools/Add-ons"
* Click ZotIF "Preferences" button
* Click the "Change path..." button and select your csv file

Now, Zotero will add in the 'extra' field key:value pairs of the form
<pre>
  IMPACT: 10.23
</pre>

You can use this value in your style by using the html construct:
<pre>
  &lt;text variable="IMPACT" prefix="IF = "/>
</pre>

You can adapt the prefix to whatever you like. For instance, in the previous example with prices
<pre>
  &lt;text variable="IMPACT" prefix="Price = "/>
</pre>

<h1>Advanced configuration</h1>
ZotIF has 2 settings that can be edited from the Zotero advanced configurator
accessible in "Préferences...", tab "Advanced", button "Config Editor":
<pre>
"extensions.zotif.fields" = "publicationTitle,journalAbbreviation"
"extensions.zotif.key" = "IMPACT:"
</pre>
extensions.zotif.fields contains a list of comma-separated Zotero fields. ZotIF will use these fields
to find a match with the names declared in the csv file. The default value makes sens for Impact Factors
since "publicationTitle,journalAbbreviation" correspond respectively to the journal name and its abbreviation.<br/>
In the example above (a list of prices), you will presumably set this constant to "title" that is the title of the books in Zotero.<br/>

extensions.zotif.key contains the keyword that will be added to the extra field. In the default case, we put "IMPACT: 12.345" for a journal with an Impact factor of 12.345. Again, in the above example with prices, you could set "extensions.zotif.key" = "PRICE:".
Of course you must then adapt you csl style file and use &lt;text variable="PRICE" prefix="Price = "/><br/>


<em>
Have fun and report problems.
This is my first Zotero extension and my first Javascript and xul program.
I suppose there are many bugs.
Part of the code has been borrowed from Zotero ZotFile plugin http://www.zotfile.com/
</em>
  
