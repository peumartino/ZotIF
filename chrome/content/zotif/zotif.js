if (typeof Zotero === 'undefined') {
    Zotero = {};
}

Zotero.zotif = {}

Zotero.zotif.init = function() {
    Zotero.zotif.resetState();
    // Automatic IF insertion. If you don't want it you can comment lines below
    // Register the callback in Zotero as an item observer
    var notifierID = Zotero.Notifier.registerObserver(
            Zotero.zotif.notifierCallback, ['item']);

    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function(e) {
        Zotero.Notifier.unregisterObserver(notifierID);
    }, false);

    // reading local text file containing IF values
    // and store them in Zotero.zotif.IFvalues
    Zotero.zotif.resetPrefs();
};

Zotero.zotif.notifierCallback = {
    notify: function(event, type, ids, extraData) {
        if (event == 'add') {
            Zotero.zotif.updateItems(Zotero.Items.get(ids));
        }
    }
};

Zotero.zotif.resetState = function() {
    Zotero.zotif.current = -1;
    Zotero.zotif.toUpdate = 0;
    Zotero.zotif.itemsToUpdate = null;
    Zotero.zotif.numberOfUpdatedItems = 0;
};

Zotero.zotif.updateSelectedEntity = function(libraryId) {
    if (!ZoteroPane.canEdit()) {
        ZoteroPane.displayCannotEditLibraryMessage();
        return;
    }

    var collection = ZoteroPane.getSelectedCollection();
    var group = ZoteroPane.getSelectedGroup();

    if (collection) {
        var items = [];
        collection.getChildItems(false).forEach(function (item) {
            items.push(Zotero.Items.get(item.id));
        });
        Zotero.zotif.updateItems(items);
    } else if (group) {
        if (!group.editable) {
            alert("This group is not editable!");
            return;
        }
        var items = [];
        group.getCollections().forEach(function(collection) {
            collection.getChildItems(false).forEach(function(item) {
                items.push(Zotero.Items.get(item.id));
            })
        });
        Zotero.zotif.updateItems(items);
    } else {
        Zotero.zotif.updateAll();
    }
};

Zotero.zotif.updateSelectedItems = function() {
    Zotero.zotif.updateItems(ZoteroPane.getSelectedItems());
};

Zotero.zotif.updateAll = function() {
    var items = [];
    Zotero.Items.getAll().forEach(function (item) {
        if (item.isRegularItem() && !item.isCollection()) {
            var libraryId = item.getField('libraryID');
            if (libraryId == null ||
                    libraryId == '' ||
                    Zotero.Libraries.isEditable(libraryId)) {
                items.push(item);
            }
        }
    });
    Zotero.zotif.updateItems(items);
};

Zotero.zotif.updateItems = function(items) {
    if (items.length == 0 ||
            Zotero.zotif.numberOfUpdatedItems < Zotero.zotif.toUpdate) {
        return;
    }

    Zotero.zotif.resetState();
    Zotero.zotif.toUpdate = items.length;
    Zotero.zotif.itemsToUpdate = items;
    Zotero.zotif.updateNextItem();
};

Zotero.zotif.updateNextItem = function() {
    Zotero.zotif.numberOfUpdatedItems++;

    if (Zotero.zotif.current == Zotero.zotif.toUpdate - 1) {
        Zotero.zotif.resetState();
        return;
    }

    Zotero.zotif.current++;
    Zotero.zotif.updateItem(
            Zotero.zotif.itemsToUpdate[Zotero.zotif.current]);
};

Zotero.zotif.updateItem = function(item) {
    if (item.isRegularItem() && !item.isCollection()) {
        // looking for journal value in the DOM
        // we use the journal name and the abbreviations
        // fields: publicationTitle / journalAbbreviation
        // we try different formats since the way the journal
        // has been entered may be quite different.
        // Particularly if entered by hand.
        // if (Zotero.zotif.IFvalues.has(item.getField('publicationTitle').toUpperCase())) {
        //   ifvalue = Zotero.zotif.IFvalues.get(item.getField('publicationTitle').toUpperCase())
        // } else if (Zotero.zotif.IFvalues.has(item.getField('journalAbbreviation').toUpperCase())) {
        //   ifvalue = Zotero.zotif.IFvalues.get(item.getField('journalAbbreviation').toUpperCase())
        // if (Zotero.zotif.IFvalues.has(item.getField('publicationTitle').toUpperCase().replace(/\./g,''))) {
        //   ifvalue = Zotero.zotif.IFvalues.get(item.getField('publicationTitle').toUpperCase().replace(/\./g,''))
        // } else if (Zotero.zotif.IFvalues.has(item.getField('journalAbbreviation').toUpperCase().replace(/\./g,''))) {
        //   ifvalue = Zotero.zotif.IFvalues.get(item.getField('journalAbbreviation').toUpperCase().replace(/\./g,''))
        // } else {
        //   ifvalue = false
        // }

        // We look in all the fields defined in extensions.zotif.fields
        // defautl is: publicationTitle,journalAbbreviation
        ifvalue = false;
        for (i in Zotero.zotif.fields){
          if (Zotero.zotif.IFvalues.has(item.getField(Zotero.zotif.fields[i]).toUpperCase().replace(/\./g,''))) {
            ifvalue = Zotero.zotif.IFvalues.get(item.getField(Zotero.zotif.fields[i]).toUpperCase().replace(/\./g,''));
            break
          }
        }

        if (ifvalue) {
          var citation = Zotero.zotif.key + ' ' + ifvalue
          var old = item.getField('extra');
          old = old.split(/\n|\r\n/);
          var ssearch = '^'+Zotero.zotif.key+'.*';
          if (old.length == 0){item.setField('extra', citation);}
          else{
            var done = false;
            for (i in old){
              if (old[i].search(ssearch)==0){
                if (!done){
                  old[i] = citation;
                  done = true;
                } else {
                  old[i] = '';  // duplicate value. We remove the second
                }
              }
            }
            if (!done){
              old[old.length] = citation;
            }
            item.setField('extra',old.join('\n'));
          }
          // if (old.length == 0) {
          //     item.setField('extra', citations);
          // } else if (old.search(ssearch) == 0) {
          //     item.setField(
          //             'extra',
          //             old.replace(ssearch, citations));
          // } else {
          //     item.setField('extra', citations + '\n' + old);
          // }
          item.saveTx();
        }
    }
    Zotero.zotif.updateNextItem();
};

/**
 * Choose directory from file picker
 * @return {string} Path to file
 */
Zotero.zotif.chooseFile = function () {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
    var win = wm.getMostRecentWindow('navigator:browser');
    var ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    while (true) {
        var fp = Components.classes["@mozilla.org/filepicker;1"]
            .createInstance(nsIFilePicker);
        fp.init(win, "Please, select the IF file", nsIFilePicker.modeOpen);
        fp.appendFilters(nsIFilePicker.filterAll);
        if (fp.show() != nsIFilePicker.returnOK) return '';
        var file = fp.file;
        return file.path;
    }
};

Zotero.zotif.resetPrefs = function(){
  // reading local csv file containing IF values
  // and store them in Zotero.zotif.IFvalues
  var xmlhttp = new XMLHttpRequest();
  // xmlhttp.open("GET","file:///......../nlm_IF.xml",false); To be set in prefs
  var prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService).getBranch("extensions.zotif.");
  var myprefs = prefs.getComplexValue("iffile", Components.interfaces.nsISupportsString).data;
  xmlhttp.open("GET",myprefs,false);
  xmlhttp.overrideMimeType('text/txt');
  xmlhttp.send(null);
  // no status for file:// ; always return 0 ; no reason to test
  var csv = xmlhttp.responseText.split(/\r\n|\n/);
  // contruction of a Map for quick access
  // journals.set("THE JOURNAL OF BIOLOGICAL CHEMISTRY","5.2")
  var journals = new Map();
  for (i = 0; i <csv.length; i++){
    try {
      var entries = csv[i].split(/,/);
      if (entries[0] !== '' && entries[2] !== ''){
        journals.set(entries[0].toUpperCase().replace(/\./g,''),entries[2]);}
      if (entries[1] !== '' && entries[2] !== ''){
        journals.set(entries[1].toUpperCase().replace(/\./g,''),entries[2]);}
    }
    catch (e) {console.log(e);}
  }
  Zotero.zotif.IFvalues = journals;
  // list of fields. comma-separated-list of field names
  myprefs = prefs.getCharPref("fields");
  Zotero.zotif.fields = myprefs.split(/,/);
  // keyword to annotate the value in extra field
  // default is 'IMPACT:'
  Zotero.zotif.key = prefs.getCharPref("key");
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', function(e) {
        Zotero.zotif.init();
    }, false);
};

// if (typeof module === 'undefined') {
//     module = {};
// }
// module.exports = Zotero.zotif;
