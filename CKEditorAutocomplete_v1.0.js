var menuBody;
var suggestions;
var element = {};
var url = site_url + '/admin/SmartTags/smartTagsCKEDITOR';

$.ajax({

    type: 'POST',
    url: url,
    dataType: 'json',
    data: {iSchemeID: CKEDITOR.iSchemeID},
    success: function (data) {
        suggestions = data;
    }
});

CKEDITOR.plugins.add('smarttags',
    {
        init: function (editor) {

            var pluginDirectory = this.path;

            editor.addCommand('IconWork', {
                exec: function (edt) {
                    alert(edt.getData());
                }
            });

            editor.ui.addRichCombo("addTags", {
                label: 'Add Tag',
                toolbar: 'addTags',
                command: 'IconWork',
                init: function () {
                    var list = this;
                    $.each(suggestions, function (i, suggestion) {
                        list.add(suggestion.label);
                    });
                },

                onClick: function (value) {

                    editor.insertHtml('#{' + value + '}&nbsp;');
                }
            });

            editor.addCommand('smarttags', {
                exec: function (editor) {
                    var dummyElement = editor.document
                        .createElement('span');
                    editor.insertElement(dummyElement);
                    var x = 0;
                    var y = 0;
                    var obj = dummyElement.$;


                    while (obj.offsetParent) {
                        x += obj.offsetLeft;
                        y += obj.offsetTop;
                        obj = obj.offsetParent;
                    }
                    x += obj.offsetLeft;
                    y += obj.offsetTop;

                    dummyElement.remove();

                    editor.contextMenu.open(editor.document
                        .getBody(), null, x, y);

                    var head = editor.contextMenu._.panel.element.$.firstChild.contentWindow.document.getElementsByTagName('head');
                    $(head).append('<link rel="stylesheet" href="' + pluginDirectory + 'styles/smartTags.css" type="text/css" />');
                }
            });
        },

        afterInit: function (editor) {

            editor.contextMenu.addListener(function (element) {
                element.on('contextmenu', function (evt) {

                    if (evt.data.$.button == 2) {
                        editor.removeMenuItem('suggestionBoxItem');
                        $.each(suggestions, function (i) {
                            var suggestionBoxItemForRemove = "suggestionBoxItem" + i;
                            editor.removeMenuItem(suggestionBoxItemForRemove);
                        })
                    }
                });
            });

            editor.addCommand('autocomplete', {
                exec: function (editor) {

                    editor.execCommand('reloadSuggetionBox');
                    editor.execCommand('smarttags');

                    var searched = '';
                    var menuPanel = editor.contextMenu._.panel.element.$.firstChild;
                    menuBody = menuPanel.contentWindow.document.getElementsByTagName('body');
                    element = menuPanel.contentWindow.document.getElementById(editor.name);
                    var menu = menuPanel.contentWindow.document.getElementsByClassName('cke_menuitem');
                    var spans = $(menu).not(':eq(0)');
                    var savedSpans = spans.slice(0);
                    var input = $(menu[0]).find('a');

                    $(menuBody).off('keyup');

                    spans.find('a').addClass('smarttags_autocomplete');
                    input.removeAttr("onclick");
                    input.removeAttr("_cke_focus");

                    $(menuBody).on('keydown', function (e) {
                        if (e.which == 8 ) {
                            element.focus();
                        }
                    });

                    $(menuBody).on('keyup', function (e) {
                        if (e.which == 51) {
                            element.focus();
                        }

                        if (e.which == 8) {
                            spans = savedSpans.slice(0);
                        }

                        if ((e.which <= 90 && e.which >= 48 || e.which == 8) && e.which != 51) {
                            var char = String.fromCharCode(e.keyCode).toLowerCase();

                            element.focus();

                            if (e.which != 8) {
                                $(element).val(searched + char);
                            }

                            searched = $(element).val();

                            for (var i = 0, l = savedSpans.length; i < l; i++) {

                                if (spans[i] != undefined) {
                                    $(spans[i]).hide();

                                    if (searched.toLowerCase() == savedSpans[i].innerText.slice(0, searched.length).toLowerCase()) {
                                        spans[i] = savedSpans[i];
                                        $(spans[i]).show();
                                    } else {
                                        delete spans[i];
                                    }
                                }
                            }

                            if (!searched.length) {
                                editor.execCommand('autocomplete');
                            }
                            $('.cke_menu_panel').css('height', $(menuBody).height() + 'px');
                        }
                    })

                }
            })

            editor.on('key', function (evt) {
                if (evt.data.keyCode == CKEDITOR.SHIFT + 51) {
                    editor.execCommand('autocomplete');
                }
            });

            var firstExecution = true;
            var dataElement = {};

            editor.addCommand('reloadSuggetionBox', {

                exec: function (editor) {
                    if (editor.contextMenu) {

                        var label = "<input style='border: 1px solid royalblue' type='text' id='" + editor.name + "'/>";

                        dataElement = {};
                        editor.addMenuGroup('suggestionBoxGroup');
                        dataElement['suggestionBoxItem'] = CKEDITOR.TRISTATE_OFF;

                        editor.addMenuItem('suggestionBoxItem',
                            {
                                id: 0,
                                label: label,
                                group: 'suggestionBoxGroup',
                                icon: null,
                            }
                        );

                        console.log(editor);
                        $.each(suggestions, function (i, suggestion) {
                            var suggestionBoxItem = "suggestionBoxItem" + i;
                            dataElement[suggestionBoxItem] = CKEDITOR.TRISTATE_OFF;

                            onClick = function () {
                                //var innerP = editor.element.$.childNodes[0];
                                //var pastHTMLValue = $(innerP).html();
                                //var currentHTML = pastHTMLValue.substr(0, pastHTMLValue.length - 2);
                                //
                                // $(innerP).html(currentHTML);

                                var sel = editor.getSelection();
                                var element = sel.getStartElement();
                                sel.selectElement(element);


                                console.log(sel);
                                console.log(element);

                                var ranges = editor.getSelection().getRanges();

                                console.log(ranges);
                                
                                ranges[0].setStart(element.getFirst(), 0);
                                ranges[0].setEnd(element.getFirst(), 0 + 5); //range
                                sel.selectRanges([ranges[0]]);


                                editor.insertHtml('<span class="smartTag">#' + this.label + '</span>&nbsp; ');
                                $(menuBody).off('keyup');
                            }

                            editor.addMenuItem(suggestionBoxItem,
                                {
                                    id: suggestion.label,
                                    label: suggestion.label,
                                    group: 'suggestionBoxGroup',
                                    icon: null,
                                    onClick: onClick
                                });
                        });

                        if (firstExecution == true) {
                            editor.contextMenu.addListener(function () {
                                return dataElement;
                            })
                        }
                        firstExecution = false;
                    }
                }
            });
            delete editor._.menuItems.paste;
        }

    });