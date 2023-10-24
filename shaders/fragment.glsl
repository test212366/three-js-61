uniform float time;
uniform float offset;

uniform float progress;
uniform vec3 color;

uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;

float qinticOut(float t ) {
	return 1.0 - (pow(t - 1.0, 5.0));
}

void main() {
	// vec3 color = vec3(1., 1.,1.);


	float localProgress = mod(time / 5. + offset * 2., 2.);

	localProgress = qinticOut(localProgress * 2.);

	if(vUv.x > localProgress || vUv.x + 1. < localProgress) discard;


	gl_FragColor = vec4(color, 1.);
}