class Conestack
{
    constructor()
    {
        this.main_nav_link_sel = 'li.toctree-l1 > a';
        this.main_nav_toggle_sel = 'li.toctree-l1 > span.toggle';
        this.curr_nav_link_sel = 'li.toctree-l1.current a';
    }

    init() {
        this.navigation = document.querySelector('.cs-nav-toc');
        this.searchbox = document.querySelector('#searchbox');
        this.init_navigation();
        this.bind_navigation();
        this.handle_searchbox();
        this.handle_mobile();
        this.handle_images();
        this.handle_header();
        window.addEventListener('resize', cs.handle_searchbox_resize.bind(this));
    }

    init_navigation() {
        let anchor = window.location.hash;
        let sel = `${this.curr_nav_link_sel}[href='${anchor}']`;
        document.querySelector(sel)?.classList?.add('active');
        this.navigation?.classList.add('active');
    }

    bind_navigation() {
        let curr_nav_links = this.navigation.querySelectorAll(this.curr_nav_link_sel);
        curr_nav_links.forEach(elem => {
            if (!elem) return;
            elem.addEventListener('click', function (e) {
                elem.classList.remove('active');
                this.classList.add('active');
            })
        });
        let main_nav_links = this.navigation.querySelectorAll(this.main_nav_link_sel);
        main_nav_links.forEach(elem => {
            let new_span = document.createElement('span');
            new_span.classList.add('toggle');            
            elem.parentNode.insertBefore(new_span, elem);
        });
        let toggle_nav_links = this.navigation.querySelectorAll(this.main_nav_toggle_sel);
        toggle_nav_links.forEach(elem => {
            elem.addEventListener('click', (e) => {
                let next_elem = e.currentTarget.nextElementSibling;
                let expanded = next_elem.classList.contains('expanded') || (
                    next_elem.classList.contains('current') && !next_elem.classList.contains('collapsed')
                );
                let ul = e.currentTarget.parentElement.querySelector('ul');
                if (expanded) {
                    next_elem.classList.add('collapsed')
                    next_elem.classList.remove('expanded');
                    ul.style['display'] = 'none';
                } else {
                    next_elem.classList.remove('collapsed');
                    next_elem.classList.add('expanded');
                    ul.style['display'] = 'initial';
                }
            });
        });
    }

    handle_header() {
        let ext_link_elem = document.querySelector('#cs-ext-links');
        let button_width_elem = document.querySelector('#navbar-toggle');
        let ext_link_style = ext_link_elem && window.getComputedStyle(ext_link_elem);
        let button_width_style = button_width_elem && window.getComputedStyle(button_width_elem);
        // replace jquery's outerWidth()
        let ext_link_width = parseInt(ext_link_style || 0);
        // replace jquery's outerWidth(true)
        let button_width = [
            button_width_style?.marginLeft,
            button_width_style?.marginRight,
            button_width_style?.width
        ].reduce((a, b) => a + parseInt(b || 0), 0);
        let maxwidth = ext_link_width + button_width + 'px';
        document.querySelector('#logo').style['max-width'] = `calc(100% - ${maxwidth} - 3rem)`;
    }

    handle_searchbox() {
        if (window.matchMedia('(min-width:768px)').matches) {
            document.querySelector('#nav-search')?.append(this.searchbox);
        } else {
            document.querySelector('#cs-mobile-menu')?.prepend(this.searchbox);
        }
    }

    handle_searchbox_resize() {
        let nav_exists = document.querySelector('#nav-search')?.children?.length > 0;
        if (window.matchMedia('(max-width:768px)').matches && nav_exists) {
            document.querySelector('#cs-mobile-menu')?.prepend(this.searchbox);
        } else if (window.matchMedia('(min-width:768px)').matches && !nav_exists) {
            document.querySelector('#nav-search')?.append(this.searchbox);
        }
    }

    handle_mobile() {
        const is_mobile_device = (
            'ontouchstart' in document.documentElement
            && navigator.userAgent.match(/Mobi/)
        );
        if (is_mobile_device) {
            let btn = document.createElement('button');
            let i = document.createElement('i');
            btn.appendChild(i);
            btn.id = 'scrolltop';
            btn.classList.add('btn');
            i.classList.add('bi');
            i.classList.add('bi-arrow-up');
            document.querySelector('#cs-layout').append(btn);
            btn.style['display'] = 'none';
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0 });
            });
            window.addEventListener('scroll', () => {
                if (btn.style['display'] === 'none') {
                    btn.stlye['display'] = '';
                } else if (window.scrollY === 0) {
                    btn.stlye['display'] = 'none';
                }
            })
        } else {
            cs.handle_codeblocks();
        }
    }

    handle_codeblocks() {
        let btn = document.createElement('button');
        btn.classList.add('copy-literal-block');
        btn.classList.add('btn');
        btn.classList.add('btn-outline-primary');
        btn.dataset['text'] = 'Copy';
        btn.innerText = 'Copy';
        document.querySelector('.highlight')?.prepend(btn);
        document.querySelector('.copy-literal-block')?.addEventListener('click', elem => {
            navigator.clipboard.writeText(elem.nextElementSibling.innerText);
            document.querySelector('.copy-literal-block').attr('data-text', 'Copy');
            elem.dataset['text'] = 'Copied!';
        });
    }

    handle_images() {
        document.querySelectorAll('img').forEach(elem => {
            elem.attributes['title'] = elem.attributes['alt'];
        });
    }

    highlight_search_words() {
        var params = $.getQueryParameters();
        var terms = (params.highlight) ? params.highlight[0].split(/\s+/) : [];
        if (terms.length) {
            var body = document.querySelector('div.body');
            if (!body.length) {
                body = document.querySelector('body');
            }
            window.setTimeout(function() {
                $.each(terms, function() {
                    body.highlightText(this.toLowerCase(), 'highlighted');
                });
            }, 10);
            let btn = `
              <button class="highlight-link bi bi-eye-slash input-group-text"
                      onclick="Documentation.hideSearchWords()"
                      btn-title="remove highlighted words">
              </button>
            `
            $(btn).insertBefore($('#searchbox input'));
        }
    }

    hide_search_words() {
        document.querySelector('#searchbox .highlight-link').fadeOut(300).remove();
        document.querySelector('span.highlighted').removeClass('highlighted');
    }
}

let cs = new Conestack();

// Patch search highlighting related functions
Documentation.highlightSearchWords = cs.highlight_search_words;
Documentation.hideSearchWords = cs.hide_search_words;

window.addEventListener('load', () => cs.init());