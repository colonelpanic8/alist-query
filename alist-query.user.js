// ==UserScript==
// @name         alist-query
// @namespace    IvanMalison@gmail.com
// @version      0.1
// @description  Query okcupid.com with alist filters forfree
// @author       Ivan Malison
// @match        http://*.okcupid.com/match*
// @grant        none
// ==/UserScript==

ISALIST = true;
if (window.location.host.indexOf('okcupid.com') > -1 &&
    window.location.pathname.indexOf('match') > -1) {
  function alistQuery() {
    jQuery(document).ready(function() {
      ISALIST = true;
      if (MatchAjaxLoader.viewport != undefined) {
        console.log('No Need to unblock.');
        return
      }
      console.log('Unblocking ALIST functionality');
      ISALIST = true;
      wrapper = jQuery('<div id="match_results">');
      jQuery('#results_wrapper').append(wrapper);
      jQuery('#results_wrapper').removeAttr('style');
      jQuery('.match_alist.noclose.show').removeClass('show');
      jQuery('#dummy_match_list').remove();
      MatchAjaxLoader.request = function(config, create, failure, success) {
        if (this.is_requesting) {
          return;
        }
        if (this.atEnd && !config.get_previous) {
          return;
        }
        this.is_requesting = true;
        var loader = MatchAjaxLoader;
        var query = (function() {
          this.params = window.location.href.toQueryParams();
          if(loader.first) {
            delete this.params.low
            loader.first = false;
          } else {
            this.params.low = config.low;
          }
          this.params.ajax_load = 1;
          this.params.discard_prefs = 1;
          return window.location.pathname + '?' + Object.toQueryString(this.params);
        })();
        new Ajax.Request(query, {
          method: 'get',
          onCreate: create,
          onFailure: failure,
          onSuccess: function(transport) {
            this.is_requesting = false;
            try {
              var response = transport.responseText.evalJSON();
            } catch (e) {
              if ($('mal_bar_bottom')) {
                $('mal_bar_bottom').remove();
              }
              this.observe();
              return;
            }
            if (response.end) {
              this.atEnd = true;
            }
            success(response.html);
          }.bind(this)
        });
        jQuery('.match_alist.noclose.show').removeClass('show');
      }
      jQuery('.form_element.selector').removeClass('pink');
      MatchAjaxLoader.first = true;
      MatchAjaxLoader.initialize();
      Ok.MatchCardImages.initialize();
    });
  }
  var script = document.createElement("script");
  script.textContent = "(" + alistQuery.toString() + ")();";
  document.body.appendChild(script);
}
