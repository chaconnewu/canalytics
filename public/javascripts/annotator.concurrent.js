/*
** Annotator 1.2.5-dev-b83d51d
** https://github.com/okfn/annotator/
**
** Copyright 2012 Aron Carroll, Rufus Pollock, and Nick Stenning.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-02-26 22:11:45Z
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.Concurrent = (function(_super) {

    __extends(Concurrent, _super);

    Concurrent.prototype.events = {
      'annotationEditorShown': 'annotationEditorShown',
      'annotationEditorHidden': 'annotationEditorHidden'
    };

    Concurrent.prototype.options = {
      _generateUUID: function() {
        var d, uuid;
        d = new Date().getTime();
        return uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var f, r;
          r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          f = c === 'x' ? r : r & 0x7 | 0x8;
          return f.toString(16);
        });
      },
      keylist: {
        Notes: 'text',
        Location: 'location'
      }
    };

    function Concurrent(element, options) {
      Concurrent.__super__.constructor.apply(this, arguments);
      this.shareconn = new sharejs.Connection('http://localhost:3000/channel');
    }

    Concurrent.prototype.pluginInit = function() {
      if (!Annotator.supported()) {

      }
    };

    Concurrent.prototype.annotationEditorShown = function(editor, annotation) {
      var id, _this;
      _this = this;
      if (!annotation.id) {
        id = _this._generateUUID();
        annotation.id = id;
      }
      return editor.fields.forEach(function(field) {
        if (field.type === 'textarea') {
          return _this.shareconn.open(annotation.id + field.label, 'text', function(err, doc) {
            if (!doc.snapshot && annotation.text) {
              doc.insert(0, annotation.text);
            }
            return doc.attach_textarea(field.element.firstChild);
          });
        }
      });
    };

    Concurrent.prototype.annotationEditorHidden = function(editor) {
      var _this;
      _this = this;
      return Object.keys(this.shareconn.docs).forEach(function(doc) {
        editor.fields.forEach(function(field) {
          if (field.type === 'textarea') {
            return _this.shareconn.docs[doc].detach_textarea(field.element.firstChild);
          }
        });
        return _this.shareconn.docs[doc].close();
      });
    };

    Concurrent.prototype._generateUUID = function() {
      return this.options._generateUUID();
    };

    return Concurrent;

  })(Annotator.Plugin);

}).call(this);
