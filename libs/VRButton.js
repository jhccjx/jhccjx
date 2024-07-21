/**
 * @author mrdoob / http://mrdoob.com
 * @author Mugen87 / https://github.com/Mugen87
 * @author NikLever / http://niklever.com
 */

class VRButton{

	constructor( renderer, options ) {
        this.renderer = renderer;
        if (options !== undefined){
            this.onSessionStart = options.onSessionStart;
            this.onSessionEnd = options.onSessionEnd;
            this.sessionInit = options.sessionInit;
            this.sessionMode = ( options.inline !== undefined && options.inline ) ? 'inline' : 'immersive-vr';
        }else{
            this.sessionMode = 'immersive-vr';
        }
        
       if (this.sessionInit === undefined ) this.sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
        
        if ( 'xr' in navigator ) {

			const button = document.createElement( 'button' );
			button.style.display = 'none';
            button.style.height = '40px';
            
			navigator.xr.isSessionSupported( this.sessionMode ).then( ( supported ) => {

				supported ? this.showEnterVR( button ) : this.showWebXRNotFound( button );
                if (options && options.vrStatus) options.vrStatus( supported );
                
			} );
            
            document.body.appendChild( button );

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; 

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = '0px';
			message.style.width = '100%';
			message.style.textDecoration = 'none';

			this.stylizeElement( message, false );
            message.style.bottom = '0px';
            message.style.opacity = '1';
            
            document.body.appendChild ( message );
            
            if (options.vrStatus) options.vrStatus( false );

		}

    }

	showEnterVR( button ) {

        let currentSession = null;
        const self = this;
        
        this.stylizeElement( button, true, 30, true );
        
        function onSessionStarted( session ) {

            session.addEventListener( 'end', onSessionEnded );

            self.renderer.xr.setSession( session );
            self.stylizeElement( button, false, 12, true );
            
            button.textContent = 'EXIT VR';

            currentSession = session;
            
            if (self.onSessionStart !== undefined) self.onSessionStart();

        }

        function onSessionEnded( ) {

            currentSession.removeEventListener( 'end', onSessionEnded );

            self.stylizeElement( button, true, 12, true );
            button.textContent = 'ENTER VR';

            currentSession = null;
            
            if (self.onSessionEnd !== undefined) self.onSessionEnd();

        }

        button.style.display = '';
        button.style.position = 'absolute'; 
        button.style.top = '50%'; 
        button.style.left = '50%'; 
        button.style.transform = 'translate(-50%, -50%)'; 
        button.style.width = '80px';
        button.style.cursor = 'pointer';
        button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-vr" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 0 0-8 8c0 3.313 2.013 6.166 4.761 7.434A2.5 2.5 0 0 1 6 14.5h4a2.5 2.5 0 0 1 .239 1.934C13.987 14.166 16 11.313 16 8a8 8 0 0 0-8-8zm-1.5 11H6v-1.5h.5v1.5zm1.5 0H8v-1.5h.5v1.5zm1.5 0H10v-1.5h.5v1.5zm1.5 0H12v-1.5h.5v1.5zM8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z"/>
        </svg>
    `;

        button.onmouseenter = function () {
            button.style.fontSize = '12px';
            button.textContent = (currentSession === null) ? 'ENTER VR' : 'EXIT VR';
            button.style.opacity = '1.0';
         };

        button.onmouseleave = function () {
            button.style.fontSize = '30px';
            button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-vr" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 0 0-8 8c0 3.313 2.013 6.166 4.761 7.434A2.5 2.5 0 0 1 6 14.5h4a2.5 2.5 0 0 1 .239 1.934C13.987 14.166 16 11.313 16 8a8 8 0 0 0-8-8zm-1.5 11H6v-1.5h.5v1.5zm1.5 0H8v-1.5h.5v1.5zm1.5 0H10v-1.5h.5v1.5zm1.5 0H12v-1.5h.5v1.5zM8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z"/>
            </svg>
        `;
            button.style.opacity = '0.5';
        };

        button.onclick = function () {
            if (currentSession === null) {
                navigator.xr.requestSession(self.sessionMode, self.sessionInit).then(onSessionStarted);
            } else {
                currentSession.end();
            }
        };

        //

        button.onclick = function () {

            if ( currentSession === null ) {

                // WebXR's requestReferenceSpace only works if the corresponding feature
                // was requested at session creation time. For simplicity, just ask for
                // the interesting ones as optional features, but be aware that the
                // requestReferenceSpace call will fail if it turns out to be unavailable.
                // ('local' is always available for immersive sessions and doesn't need to
                // be requested separately.)

                navigator.xr.requestSession( self.sessionMode, self.sessionInit ).then( onSessionStarted );

            } else {

                currentSession.end();

            }

        };

    }

    disableButton(button) {

        button.style.cursor = 'auto';
        button.style.opacity = '0.5';
        
        button.onmouseenter = null;
        button.onmouseleave = null;

        button.onclick = null;

    }

    showWebXRNotFound( button ) {
        this.stylizeElement( button, false );
        
        this.disableButton(button);

        button.style.display = '';
        button.style.width = '100%';
        button.style.right = '0px';
        button.style.bottom = '0px';
        button.style.border = '';
        button.style.opacity = '1';
        button.style.fontSize = '13px';
        button.textContent = 'VR NOT SUPPORTED';
        
        

    }

    stylizeElement( element, active = true, fontSize = 13, ignorePadding = false ) {

        element.style.position = 'absolute';
        element.style.bottom = '20px';
        if (!ignorePadding) element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = active ? 'rgba(0, 123, 255, 1)' : 'rgba(255, 0, 0, 1)';
        element.style.color = '#fff';
        element.style.font = `normal ${fontSize}px sans-serif`;
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';

    }

		

};

export { VRButton };
