let currentVNode = undefined;
let currentHook = 0;
let rootDom = undefined;
let rootVNode = undefined;

export function h(type, props) {
    console.log(arguments);
    let children;

    if (arguments.length > 2) {
        children = Array.prototype.slice.call(arguments, 2);
    }
    //console.log(type, props, children);

    // we are going to hold the state in the VNode
    // how to copy state when diffing? store state in Component object, copy
    // over reference
    // learn how react fiber works to setup scheduler

    return createVNode(type, props, children);
}

function buildVNodeTree(vnode) {
    //console.log(`Building tree for ${vnode}`);

    // this is where we init state
    // another function to rebuild

    if (typeof vnode.type === "function") {
        const [saveCurrentHook, saveCurrentVNode] = [currentHook, currentVNode];
        // load state
        currentHook = 0;
        currentVNode = vnode;

        vnode.childVNode = vnode.type(vnode.props);
        buildVNodeTree(vnode.childVNode);

        currentHook = saveCurrentHook;
        currentVNode = saveCurrentVNode;
        return;
    }

    if(vnode.type instanceof Context.Provider) {
        // register Context Consumer for the subtree
    }

    if (vnode.children !== undefined) {
        for (const child of vnode.children) {
            buildVNodeTree(child);
        }
    }
}

export function render(vnode, parentDom) {
    //console.log("starting render");
    rootVNode = vnode;
    rootDom = parentDom;
    while (parentDom.firstChild) {
        parentDom.removeChild(parentDom.firstChild);
    }
    buildVNodeTree(vnode);
    rerender(vnode, parentDom);
}

function rerender(vnode, parentDom) {
    //console.log(`Rendering ${vnode}`)

    if (typeof vnode === "string") {
        const node = document.createTextNode(vnode);
        parentDom.appendChild(node);
        return;
    } else if (typeof vnode.type === "string") {
        const newElem = document.createElement(vnode.type);
        parentDom.appendChild(newElem);

        if (vnode.props) {
            console.log(`populating ${vnode.props}`)
            for (const [key, value] of Object.entries(vnode.props)) {
                if(key === 'onClick') {
                    newElem.onclick = value;
                }
                 else {
                     newElem.setAttribute(key, value);
                 }
            }
        }

        if (vnode.children !== undefined) {
            for (let child of vnode.children) {
                rerender(child, newElem);
            }
        }
        return;
    } else if (
        typeof vnode.type === "function" &&
        vnode.childVNode !== undefined
    ) {
        rerender(vnode.childVNode, parentDom);
    } else if(vnode.type instanceof Context.Provider || vnode.type instanceof Context.Consumer) {
        // here we need to keep rendering the children.
    } 
    else {
        throw Error(`Invalid vnode type ${vnode.type}`);
    }
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children,
    };
}

// we need to know which dom element corresponds to a Component
// when a component changes, that's what triggers a rerender
// evaluate the component, diff it with the DOM

// parentDom with a single node
function diff(oldVNode, newVNode, parentDom) {
    if (oldVNode.type !== newVNode.type) {
        // delete old children
        // render newVNode
    }
}

function diffChildren(oldVNode, newVNode) { }

export function useState(initialValue) {
    if (currentVNode.states === undefined) currentVNode.states = [initialValue];
    else if (currentVNode.states.length - 1 < currentHook)
        currentVNode.states.push(initialValue);

    const value = currentVNode.states[currentHook];
    const boundVNode = currentVNode;
    const boundCurrentHook = currentHook;
    const updateValue = (newVal) => {
        boundVNode.states[boundCurrentHook] = newVal;
        flagRerender(boundVNode);
    };

    currentHook++;

    return [value, updateValue];
}

function compareDeps(arr1, arr2) {
    console.log(arr1)
    console.log(arr2)

    for(let i=0;i<arr1.length;i++){
        if(arr1[i] != arr2[i]) return false;
    }
    return true;
}

export function useEffect(callback, deps) {
    // need to store cleanup function as well

    // store the dependencies in the state array
    if (currentVNode.states === undefined) {
        const cleanupFn = callback();
        currentVNode.states = [{deps, cleanupFn}];
    }
    else if (currentVNode.states.length - 1 < currentHook) {
        const cleanupFn = callback();
        currentVNode.states.push({deps, cleanupFn});
    }
    else if(!compareDeps(deps, currentVNode.states[currentHook].deps)){
        const oldCleanupFn = currentVNode.states[currentHook].cleanupFn;
        if(oldCleanupFn !== undefined) oldCleanupFn();
        const cleanupFn = callback();
        currentVNode.states[currentHook] = {deps, cleanupFn};
    }

    currentHook++;
}

function flagRerender(vnode) {
    buildVNodeTree(vnode);
    render(rootVNode, rootDom);
}


