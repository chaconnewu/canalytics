/*
** Annotator 1.2.5-dev-b83d51d
** https://github.com/okfn/annotator/
**
** Copyright 2012 Aron Carroll, Rufus Pollock, and Nick Stenning.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-07-17 15:21:14Z
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.Concurrent = (function(_super) {

    __extends(Concurrent, _super);

    function Concurrent() {
      return Concurrent.__super__.constructor.apply(this, arguments);
    }

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
      }
    };

    Concurrent.prototype.pluginInit = function() {
      if (!Annotator.supported()) {

      }
    };

    Concurrent.prototype.annotationEditorShown = function(editor, annotation) {
      return $('.annotator-status').load('/sync', {
        id: annotation.id
      }, function(data) {
        if (data.indexOf('please wait') !== -1) {
          $('.annotator-widget :input').prop('disabled', true);
          return $('.annotator-save').addClass('dom-disabled');
        }
      });
    };

    Concurrent.prototype.annotationEditorHidden = function(editor) {
      return $('.annotator-status').load('/desync', function() {
        $('.annotator-widget :input').prop('disabled', false);
        return $('.annotator-save').removeClass('dom-disabled');
      });
    };

    Concurrent.prototype._generateUUID = function() {
      return this.options._generateUUID();
    };

    return Concurrent;

  })(Annotator.Plugin);

}).call(this);
