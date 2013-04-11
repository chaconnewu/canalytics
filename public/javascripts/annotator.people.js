/*
** Annotator 1.2.5-dev-b83d51d
** https://github.com/okfn/annotator/
**
** Copyright 2012 Aron Carroll, Rufus Pollock, and Nick Stenning.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-02-08 18:57:16Z
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.People = (function(_super) {

    __extends(People, _super);

    function People() {
      this.setAnnotationRelationship = __bind(this.setAnnotationRelationship, this);

      this.setAnnotationPeople = __bind(this.setAnnotationPeople, this);

      this.updateField2 = __bind(this.updateField2, this);

      this.updateField1 = __bind(this.updateField1, this);
      return People.__super__.constructor.apply(this, arguments);
    }

    People.prototype.options = {
      parsePeople: function(string) {
        var people;
        string = $.trim(string);
        people = [];
        if (string) {
          people = string.split(',');
        }
        return people;
      },
      stringifyPeople: function(array) {
        return array.join(" ");
      }
    };

    People.prototype.field = null;

    People.prototype.input = null;

    People.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      this.field1 = this.annotator.editor.addField({
        type: 'select1',
        label: Annotator._t('Attendees'),
        load: this.updateField1,
        submit: this.setAnnotationPeople
      });
      this.field2 = this.annotator.editor.addField({
        type: 'select2',
        label: Annotator._t('Relationship'),
        load: this.updateField2,
        submit: this.setAnnotationRelationship
      });
      this.annotator.viewer.addField({
        load: this.updateViewer
      });
      this.input1 = $(this.field1).find('select');
      this.input2 = $(this.field2).find('select');
      this.annotator.subscribe('annotationEditorShown', this.loadGraph);
      return this.annotator.subscribe('annotationEditorSubmit', this.updateGraph);
    };

    People.prototype.parsePeople = function(string) {
      return this.options.parsePeople(string);
    };

    People.prototype.stringifyPeople = function(array) {
      return this.options.stringifyPeople(array);
    };

    People.prototype.loadGraph = function(editor, annotation) {
      annotation.oldpeople = annotation.people ? annotation.people : [];
      return annotation.oldrelationship = annotation.relationship ? annotation.relationship : [];
    };

    People.prototype.updateGraph = function(editor, annotation) {};

    People.prototype.updateField1 = function(field, annotation) {
      var value;
      value = '';
      if (annotation.people) {
        value = this.stringifyPeople(annotation.people);
      }
      return this.input1.val(value);
    };

    People.prototype.updateField2 = function(field, annotation) {
      var value;
      value = '';
      if (annotation.relationship) {
        value = this.stringifyPeople(annotation.relationship);
      }
      return this.input2.val(value);
    };

    People.prototype.setAnnotationPeople = function(field, annotation) {
      return annotation.people = this.parsePeople(this.input1.val());
    };

    People.prototype.setAnnotationRelationship = function(field, annotation) {
      return annotation.relationship = this.parsePeople(this.input2.val());
    };

    People.prototype.updateViewer = function(field, annotation) {
      field = $(field);
      if (annotation.people && $.isArray(annotation.people) && annotation.people.length) {
        return field.addClass('annotator-people').html(function() {
          var string;
          string = $.map(annotation.people, function(person) {
            return '<span class="annotator-person">' + Annotator.$.escape(person) + '</span>';
          }).join(' ');
          return string = string + " are in a relationship " + annotation.relationship;
        });
      } else {
        return field.remove();
      }
    };

    return People;

  })(Annotator.Plugin);

}).call(this);
