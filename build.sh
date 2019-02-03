#!/bin/sh

version=0.1
rm builds/zotif-${version}.xpi
zip -r builds/zotif-${version}.xpi chrome/* chrome.manifest install.rdf defaults -x *\.DS_Store
