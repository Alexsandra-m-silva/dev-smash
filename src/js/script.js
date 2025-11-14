class TemplateEngine_renderData {
                constructor(template_url){
                    this.template_url = template_url;
                }
                loadTemplate(){
                    return fetch(this.template_url)
                    .then(response => response.text())
                    .then(text => {
                        this.template = text;
                    })
                }
                renderTemplate(tag_id, data){
                    const tag = document.getElementById(tag_id);
                    let output = this.template;
                    // deal with any each loops
                    output = output.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match,arrayName, templateFragment) => {
                        console.log(arrayName, ' found in template');
                        const items = data[arrayName];
                        console.log(items.length);
                        if (!Array.isArray(items)) {
                            return '';
                        }
                            return items.map(item => this.replaceVariablesInFragment(templateFragment, item)).join('');

                    });
                    console.log(output);
                   // Handle if-else conditions
                   output = output.replace(/{{#if (\w+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g, (match, condition, ifContent, elseContent) => {
                        return data[condition] ? ifContent : elseContent;
                    }); 
                    /* Handle if conditions without else - Globally
                    output = output.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, ifContent) => {
                        return data[condition] ? ifContent : '';
                    });
                    */ 
                   // Handle if conditions without else - Applies to conditionals inside each loops
                    output = output.replace(/{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g, (match, condition, ifContent) => {
                        console.log("Conditional here");
                        console.log(data[condition]);
                        console.log(ifContent);
                        const cond = condition.trim().toLowerCase();
                        return (cond === "true" || cond === "1") ? ifContent : '';
                
                    });
                   // deal with any simple variables
                    output = output.replace(/{{(\w+)}}/g, (match, dataField) => {
                        return data[dataField] 
                    });
                    tag.innerHTML = output;
                }

                replaceVariablesInFragment(templateFragment, data) {
                    return templateFragment.replace(/{{(\w+)}}/g, (match, dataKey) => {
                        console.log("looking for", dataKey);
                        return data[dataKey];
                    });
                }
            };
            // Example usage
            const tEngine = new TemplateEngine_renderData("./templates/template.html");
            const data = {
                pageTitle: "", // filled from content.json
                footer: [], // filled from content.json
                navTitle: "", // filled from content.json
                navItems: [] //  filled from content.json
            };
            // Load nav items from JSON file
            fetch('./data/content.json')
            .then(response => response.json())
            .then(navData => {
                // navData[3] contains the object with page title data
                data.pageTitle = navData[3].pageTitle;
                // navData[2] contains the object with footer data
                data.footer = navData[2].footer;
                // navData[1] contains the object with navItems
                data.navItems = navData[1].navItems;
                data.navTitle = navData[1].navTitle;
            // Load the template and render it
            return tEngine.loadTemplate();
            })
            .then(() => {
                console.log("template loaded");
                tEngine.renderTemplate('content', data);
            });
            console.log(tEngine);
            

            