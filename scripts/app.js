(function () {
  'use strict';

  var app = {
    navigationMenu: document.getElementById('js-side-navigation'),
    navigationMenuNavContainer: document.getElementById('js-side-navigation__container'),
    navigationMenuNavHeader: document.getElementById('js-side-navigation__header'),
    navigationButtonShow: document.getElementById('js-navigation-menu-button-show'),
    navigationButtonHide: document.getElementById('js-navigation-menu-button-hide'),

    startX: 0,
    currentX: 0,

    daysUntilEnd: document.getElementById('daysUntilEnd'),
    relatoriosNaoEnviadosContainer: document.getElementById('relatoriosNaoEnviadosContainer'),
    relatoriosNaoEnviadosList: document.getElementById('relatoriosNaoEnviadosList'),
    relatoriosEnviadosContainer: document.getElementById('relatoriosEnviadosContainer'),
    relatoriosEnviadosList: document.getElementById('relatoriosEnviadosList')
  };

  /*****************************************************************************
  *
  * Event listeners for UI elements
  *
  ****************************************************************************/

  app.navigationMenu.addEventListener('click', function () {
    app.toggleNavigationMenu(false);
  });

  app.navigationButtonShow.addEventListener('click', function () {
    app.toggleNavigationMenu(true);
  });

  app.navigationButtonHide.addEventListener('click', function () {
    app.toggleNavigationMenu(false);
  });

  app.navigationMenuNavContainer.addEventListener('click', function () {
    app.blockClickToSideNav(event);
  });

  app.navigationMenuNavHeader.addEventListener('touchstart', function () {
    app.onTouchStart(event);
  });

  app.navigationMenuNavHeader.addEventListener('touchmove', function () {
    app.onTouchMove(event);
  });

  app.navigationMenuNavHeader.addEventListener('touchend', function () {
    app.onTouchEnd(event);
  });

  /*****************************************************************************
  *
  * Methods to update/refresh the UI
  *
  ****************************************************************************/

  app.onTransitionEnd = function (event) {
    app.navigationMenu.classList.remove('side-navigation--animatable');
    app.navigationMenu.removeEventListener('transitionend', app.onTransitionEnd);
  };

  // Toggles the class visibility of the side navigation menu
  app.toggleNavigationMenu = function (showSideNavigation) {
    if (showSideNavigation) {
      app.navigationMenu.classList.add('side-navigation--animatable');
      app.navigationMenu.classList.add('side-navigation--visible');
      app.navigationMenu.addEventListener('transitionend', app.onTransitionEnd);
    } else {
      app.navigationMenu.classList.add('side-navigation--animatable');
      app.navigationMenu.classList.remove('side-navigation--visible');
      app.navigationMenu.addEventListener('transitionend', app.onTransitionEnd);
    }
  };

  app.blockClickToSideNav = function (event) {
    event.stopPropagation();
  };

  app.onTouchStart = function (event) {
    if (!app.navigationMenu.classList.contains('side-navigation--visible')) {
      return;
    }
    app.startX = event.touches[0].pageX;
    app.currentX = app.startX;
  };

  app.onTouchMove = function (event) {
    app.currentX = event.touches[0].pageX;
    var translateX = Math.min(0, app.currentX - app.startX);
    if (translateX < 0) {
      event.preventDefault();
    }
    app.navigationMenuNavContainer.style.transform = 'translateX(' + translateX + 'px)';
  };

  app.onTouchEnd = function (event) {
    var translateX = Math.min(0, app.currentX - app.startX);
    if (translateX < 0) {
      app.navigationMenuNavContainer.style.transform = '';
      app.toggleNavigationMenu(false);
    }
  };

  /*****************************************************************************
  *
  * Check for and register service worker
  *
  ****************************************************************************/

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('service-worker.js')
    .then(function () { console.log('Service Worker Registered'); });
  }

  /*****************************************************************************
  *
  * Fetching data
  *
  *****************************************************************************/

  moment.locale("pt-br");

  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      app.daysUntilEnd.innerHTML = 'Atenção: O período de validação termina ' +
        moment(data.periodoValidacaoAtual.fim, 'YYYYMMDD').fromNow() + '.';

      data.relatorios.enviados.forEach(titulo => {
        var li = document.createElement("LI");
        var text = document.createTextNode(titulo);

        li.appendChild(text);
        app.relatoriosEnviadosList.appendChild(li);
      });

      if (data.relatorios.enviados) app.relatoriosEnviadosContainer.removeAttribute('hidden');

      data.relatorios.naoenviados.forEach(titulo => {
        var li = document.createElement("LI");
        var text = document.createTextNode(titulo);

        li.appendChild(text);
        app.relatoriosNaoEnviadosList.appendChild(li);
      });

      if (data.relatorios.naoenviados) app.relatoriosNaoEnviadosContainer.removeAttribute('hidden');

      var items = [data.relatorios.naoenviados.length, data.relatorios.enviados.length];

      var x = d3.scale.linear().domain([0, d3.max(items)]).range([0, 420]);

      d3.select(".chart")
        .selectAll("div")
        .data(items)
        .enter().append("div")
        .style("width", function(d) { return x(d) + "px"; })
        .text(function(d) { return d; });
    }
  );



})();
