var ie = new ActiveXObject('InternetExplorer.Application');
ie.Navigate('about:blank');
str = ie.document.parentWindow.clipboardData.getData("text");
ie.Quit();
WScript.Echo(str);